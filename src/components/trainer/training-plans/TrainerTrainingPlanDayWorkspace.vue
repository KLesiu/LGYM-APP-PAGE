<template>
  <div class="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <section
      v-if="hasPlanError && !isLoadingPlan"
      class="bg-[var(--lgym-surface-card)]/40 px-4 py-8 text-center sm:px-6 lg:px-8"
    >
      <p class="text-sm text-[var(--lgym-text-muted)]">
        {{ t("trainerTrainingPlanDayEditor.error.plan") }}
      </p>
      <v-btn class="mt-4" variant="outlined" color="primary" @click="reloadAll">
        {{ t("trainerTrainingPlanDayEditor.actions.retry") }}
      </v-btn>
    </section>

    <section
      v-else-if="isEditing && hasPlanDayError && !isLoadingPlanDay"
      class="bg-[var(--lgym-surface-card)]/40 px-4 py-8 text-center sm:px-6 lg:px-8"
    >
      <p class="text-sm text-[var(--lgym-text-muted)]">
        {{ t("trainerTrainingPlanDayEditor.error.planDay") }}
      </p>
      <v-btn class="mt-4" variant="outlined" color="primary" @click="reloadAll">
        {{ t("trainerTrainingPlanDayEditor.actions.retry") }}
      </v-btn>
    </section>

    <section
      v-else
      class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--lgym-surface-card)]/35"
    >
    <div class="sticky top-0 z-10 border-b border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/96 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <h3 class="truncate text-lg font-semibold text-[var(--lgym-text)]">
              {{
                isEditing
                  ? t("trainerTrainingPlanDayEditor.header.editTitle")
                  : t("trainerTrainingPlanDayEditor.header.createTitle")
              }}
            </h3>
            <p class="mt-1 truncate text-xs text-[var(--lgym-text-muted)]">
              {{ plan?.name || t("trainerTrainingPlans.fallback.noName") }}
            </p>
          </div>

          <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <v-btn variant="outlined" color="primary" prepend-icon="mdi-arrow-left" class="min-h-10 flex-1 rounded-md px-4 sm:flex-none" @click="goBackToPlan">
              {{ t("trainerTrainingPlanDayEditor.actions.backToPlan") }}
            </v-btn>
            <v-btn color="primary" class="min-h-10 flex-1 rounded-md px-4 sm:flex-none" :loading="isSaving" @click="handleSave">
              {{ t("trainerTrainingPlanDayEditor.actions.save") }}
            </v-btn>
          </div>
        </div>
      </div>

      <v-progress-linear v-if="isLoadingPlanDay" indeterminate color="primary" />

      <div class="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(300px,0.92fr)_minmax(0,1.08fr)]">
        <section class="flex min-h-0 flex-col overflow-hidden border-b border-[var(--lgym-border)] xl:border-r xl:border-b-0">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-semibold text-[var(--lgym-text)]">
                {{ t("trainerTrainingPlanDayEditor.library.title") }}
              </h4>
              <span class="text-xs text-[var(--lgym-text-muted)]">{{ filteredExercises.length }}</span>
            </div>

            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <v-text-field
                v-model="searchQuery"
                :placeholder="t('trainerTrainingPlanDayEditor.library.fields.searchPlaceholder')"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="min-w-0 w-full flex-1 sm:min-w-[220px]"
              />
              <v-select
                v-model="selectedBodyPart"
                :items="bodyPartOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="w-full shrink-0 sm:w-[170px]"
              />
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <v-btn
                v-for="source in sourceOptions"
                :key="source.value"
                :variant="exerciseSource === source.value ? 'flat' : 'outlined'"
                color="primary"
                size="small"
                class="rounded-md px-3"
                @click="exerciseSource = source.value"
              >
                {{ t(source.labelKey) }}
              </v-btn>
            </div>
          </div>

          <v-progress-linear v-if="isLoadingExercises" indeterminate color="primary" />

          <div class="min-h-0 flex-1 overflow-y-auto">
            <div v-if="hasExercisesError && !isLoadingExercises" class="px-4 py-6 text-center sm:px-6">
              <p class="text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerTrainingPlanDayEditor.library.error.load") }}
              </p>
              <v-btn class="mt-3" variant="outlined" color="primary" @click="reloadExercises">
                {{ t("trainerTrainingPlanDayEditor.actions.retry") }}
              </v-btn>
            </div>

            <div
              v-else-if="filteredExercises.length === 0"
              class="px-4 py-6 text-center text-sm text-[var(--lgym-text-muted)] sm:px-6"
            >
              {{ t("trainerTrainingPlanDayEditor.library.empty") }}
            </div>

            <VueDraggable
              v-else
              v-model="filteredExerciseItems"
              :animation="180"
              :sort="false"
              :group="libraryDragGroup"
              ghost-class="plan-day-library-ghost"
              chosen-class="plan-day-item-chosen"
              drag-class="plan-day-item-drag"
              handle=".plan-day-library-drag-handle"
              class="min-h-full"
              :clone="cloneLibraryExercise"
              @add="handleLibraryAdd"
            >
              <div
                v-for="exercise in filteredExerciseItems"
                :key="exercise._id || exercise.name || 'exercise'"
                class="grid w-full grid-cols-1 gap-3 border-b border-[var(--lgym-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--lgym-note-bg)]/22 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-2 sm:px-6"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-[var(--lgym-text)]">
                    {{ exercise.name || t("trainerTrainingPlanDetails.exercises.fallback.noName") }}
                  </p>
                  <div class="mt-1 flex flex-wrap items-center gap-1.5">
                    <v-chip
                      v-if="exercise.bodyPart?.displayName || exercise.bodyPart?.name"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ exercise.bodyPart?.displayName || exercise.bodyPart?.name }}
                    </v-chip>
                    <v-chip size="x-small" variant="outlined" color="primary">
                      {{ exercise.user ? t("trainerTrainingPlanDayEditor.library.source.user") : t("trainerTrainingPlanDayEditor.library.source.global") }}
                    </v-chip>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-1">
                  <div
                    v-if="exercise._id"
                    class="plan-day-library-drag-handle flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[var(--lgym-text-muted)] transition-colors hover:bg-[var(--lgym-note-bg)]/40 hover:text-[var(--lgym-text)]"
                    :class="{
                      'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-[var(--lgym-text-muted)]':
                        hasExerciseInDraft(exercise._id),
                    }"
                    :title="hasExerciseInDraft(exercise._id) ? t('trainerTrainingPlanDayEditor.library.actions.added') : t('trainerTrainingPlanDayEditor.library.actions.drag')"
                    :aria-label="hasExerciseInDraft(exercise._id) ? t('trainerTrainingPlanDayEditor.library.actions.added') : t('trainerTrainingPlanDayEditor.library.actions.drag')"
                  >
                    <v-icon icon="mdi-drag" size="18" />
                    <span class="hidden text-xs font-medium xl:inline">
                      {{ t("trainerTrainingPlanDayEditor.library.actions.dragShort") }}
                    </span>
                  </div>
                  <v-btn
                    :icon="hasExerciseInDraft(exercise._id) ? 'mdi-check' : 'mdi-plus'"
                    size="small"
                    variant="text"
                    color="primary"
                    :title="hasExerciseInDraft(exercise._id) ? t('trainerTrainingPlanDayEditor.library.actions.added') : t('trainerTrainingPlanDayEditor.library.actions.add')"
                    :aria-label="hasExerciseInDraft(exercise._id) ? t('trainerTrainingPlanDayEditor.library.actions.added') : t('trainerTrainingPlanDayEditor.library.actions.add')"
                    @click="addExercise(exercise)"
                  />
                </div>
              </div>
            </VueDraggable>
          </div>
        </section>

        <section class="flex min-h-0 flex-col overflow-hidden bg-[var(--lgym-surface-card)]/18">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-semibold text-[var(--lgym-text)]">
                {{ t("trainerTrainingPlanDayEditor.selection.title") }}
              </h4>
              <span class="text-xs text-[var(--lgym-text-muted)]">{{ draftExercisesModel.length }}</span>
            </div>

            <div class="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <v-text-field
                v-model="draftName"
                :placeholder="t('trainerTrainingPlanDayEditor.basics.fields.namePlaceholder')"
                density="compact"
                variant="outlined"
                hide-details
              />
              <div class="text-xs text-[var(--lgym-text-muted)] xl:text-right">
                {{ t("trainerTrainingPlanDayEditor.selection.summary", { count: draftExercisesModel.length }) }}
              </div>
            </div>
          </div>

          <div class="hidden border-b border-[var(--lgym-border)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)] xl:grid xl:grid-cols-[minmax(0,1fr)_104px_96px_112px] xl:gap-3 sm:px-6">
            <span>{{ t("trainerTrainingPlanDayEditor.selection.title") }}</span>
            <span>{{ t("trainerTrainingPlanDayEditor.selection.fields.reps") }}</span>
            <span>{{ t("trainerTrainingPlanDayEditor.selection.fields.series") }}</span>
            <span class="text-right">{{ t("trainerTrainingPlanDayEditor.selection.fields.order") }}</span>
          </div>

          <VueDraggable
            v-model="draftExercisesModel"
            :animation="180"
            :group="selectionDragGroup"
            ghost-class="plan-day-selection-ghost"
            chosen-class="plan-day-item-chosen"
            drag-class="plan-day-item-drag"
            handle=".plan-day-selection-drag-handle"
            class="min-h-0 flex-1 overflow-y-auto divide-y divide-[var(--lgym-border)]"
            @add="handleSelectionAdd"
          >
            <div
              v-if="draftExercisesModel.length === 0"
              class="flex min-h-full items-center justify-center px-4 py-8 text-center text-sm text-[var(--lgym-text-muted)] sm:px-6"
            >
              {{ t("trainerTrainingPlanDayEditor.selection.empty") }}
            </div>

            <article
              v-for="(row, index) in draftExercisesModel"
              :key="row.exercise || `row-${index}`"
              class="px-4 py-3 transition-colors sm:px-6"
            >
              <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(88px,104px)_minmax(88px,96px)] sm:items-start xl:grid-cols-[minmax(0,1fr)_104px_96px_112px] xl:items-center xl:gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-[var(--lgym-text)]">
                    {{ getExerciseName(row.exercise) }}
                  </p>
                </div>

                <v-text-field
                  :model-value="row.reps ?? ''"
                  :label="t('trainerTrainingPlanDayEditor.selection.fields.reps')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="updateExerciseField(index, 'reps', String($event ?? ''))"
                />

                <v-text-field
                  :model-value="row.series ?? 1"
                  :label="t('trainerTrainingPlanDayEditor.selection.fields.series')"
                  type="number"
                  min="0"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="updateExerciseField(index, 'series', Number($event ?? 0))"
                />

                <div class="flex items-center justify-end gap-1 sm:col-span-3 sm:pt-1 xl:col-span-1 xl:pt-0">
                  <div
                    class="plan-day-selection-drag-handle flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[var(--lgym-text-muted)] transition-colors hover:bg-[var(--lgym-note-bg)]/40 hover:text-[var(--lgym-text)]"
                    :aria-label="t('trainerTrainingPlanDayEditor.selection.actions.drag')"
                    :title="t('trainerTrainingPlanDayEditor.selection.actions.drag')"
                  >
                    <v-icon icon="mdi-drag" size="18" />
                    <span class="hidden text-xs font-medium xl:inline">
                      {{ t("trainerTrainingPlanDayEditor.selection.actions.dragShort") }}
                    </span>
                  </div>
                  <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="removeExercise(index)" />
                </div>
              </div>
            </article>
          </VueDraggable>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { ExerciseResponseDto } from "../../../api/model";
import { useTrainerTrainingPlanDayEditor } from "../../../composables/useTrainerTrainingPlanDayEditor";

type DraftExerciseRow = {
  exercise: string | null;
  reps: string;
  series: number;
};

const props = defineProps<{
  planId: string;
  planDayId?: string;
  traineeId?: string;
}>();

const { t } = useI18n();
const router = useRouter();

const planIdRef = ref(props.planId);
const planDayIdRef = ref(props.planDayId ?? "");

const {
  plan,
  draft,
  allExercises,
  userExercises,
  globalExercises,
  isEditing,
  isLoadingPlan,
  hasPlanError,
  isLoadingPlanDay,
  hasPlanDayError,
  isLoadingExercises,
  hasExercisesError,
  isSaving,
  loadInitialState,
  loadExercises,
  savePlanDay,
} = useTrainerTrainingPlanDayEditor(planIdRef, planDayIdRef, {
  get value() {
    return props.traineeId ?? "";
  },
});

const searchQuery = ref("");
const selectedBodyPart = ref("all");
const exerciseSource = ref<"all" | "user" | "global">("all");

const draftName = computed({
  get: () => draft.value.name ?? "",
  set: (value: string) => {
    draft.value = {
      ...draft.value,
      name: value,
    };
  },
});

const draftExercises = computed(() => draft.value.exercises ?? []);
const knownExerciseIds = computed(
  () =>
    new Set(
      exerciseLibrary.value
        .map((exercise) => exercise._id?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
);
const draftExercisesModel = computed<DraftExerciseRow[]>({
  get: () =>
    (draft.value.exercises ?? [])
      .filter((row) => {
        const exerciseId = row.exercise?.trim();
        return Boolean(exerciseId && knownExerciseIds.value.has(exerciseId));
      })
      .map((row) => ({
        exercise: row.exercise ?? null,
        reps: String(row.reps ?? "Max"),
        series: Math.max(0, Math.trunc(Number(row.series ?? 1) || 0)),
      })),
  set: (value) => {
    draft.value = {
      ...draft.value,
      exercises: value.map((row) => ({
        exercise: row.exercise ?? null,
        reps: String(row.reps ?? "Max"),
        series: Math.max(0, Math.trunc(Number(row.series ?? 1) || 0)),
      })),
    };
  },
});
const filteredExerciseItems = computed<ExerciseResponseDto[]>({
  get: () => filteredExercises.value,
  set: () => {
    return;
  },
});
const libraryDragGroup = {
  name: "plan-day-exercises",
  pull: "clone" as const,
  put: false,
};
const selectionDragGroup = {
  name: "plan-day-exercises",
  pull: true,
  put: true,
};

const sourceOptions = [
  { value: "all", labelKey: "trainerTrainingPlanDayEditor.library.filters.all" },
  { value: "user", labelKey: "trainerTrainingPlanDayEditor.library.filters.user" },
  { value: "global", labelKey: "trainerTrainingPlanDayEditor.library.filters.global" },
] as const;

const exerciseLibrary = computed(() => {
  const combined = new Map<string, ExerciseResponseDto>();

  for (const exercise of [...allExercises.value, ...userExercises.value, ...globalExercises.value]) {
    const exerciseId = exercise._id?.trim();
    if (!exerciseId || combined.has(exerciseId)) continue;
    combined.set(exerciseId, exercise);
  }

  return [...combined.values()];
});

const bodyPartOptions = computed(() => {
  const options = new Map<string, string>();

  for (const exercise of exerciseLibrary.value) {
    const value = exercise.bodyPart?.displayName || exercise.bodyPart?.name;
    if (!value) continue;
    options.set(value, value);
  }

  return [
    { value: "all", label: t("trainerTrainingPlanDayEditor.library.filters.allBodyParts") },
    ...[...options.values()].sort((left, right) => left.localeCompare(right)).map((value) => ({
      value,
      label: value,
    })),
  ];
});

const filteredExercises = computed(() => {
  const sourceList =
    exerciseSource.value === "user"
      ? userExercises.value
      : exerciseSource.value === "global"
        ? globalExercises.value
        : exerciseLibrary.value;

  return sourceList.filter((exercise) => {
    const bodyPart = exercise.bodyPart?.displayName || exercise.bodyPart?.name || "";
    const matchesBodyPart = selectedBodyPart.value === "all" || bodyPart === selectedBodyPart.value;
    const haystack = [exercise.name, bodyPart].filter(Boolean).join(" ").toLowerCase();
    return matchesBodyPart && haystack.includes(searchQuery.value.trim().toLowerCase());
  });
});

const hasExerciseInDraft = (exerciseId: string | null | undefined) =>
  Boolean(
    exerciseId?.trim() &&
      draftExercises.value.some((row) => row.exercise?.trim() === exerciseId.trim()),
  );

const addExercise = (exercise: ExerciseResponseDto) => {
  const nextRow = cloneLibraryExercise(exercise);
  if (!nextRow || !nextRow.exercise || hasExerciseInDraft(nextRow.exercise)) return;
  draftExercisesModel.value = [...draftExercisesModel.value, nextRow];
};

const updateExerciseField = (
  index: number,
  field: "reps" | "series",
  value: string | number,
) => {
  const nextRows = [...draftExercisesModel.value];
  nextRows[index] = {
    ...(nextRows[index] ?? { exercise: null, reps: "Max", series: 1 }),
    [field]: field === "series" ? Math.max(0, Math.trunc(Number(value) || 0)) : String(value),
  };

  draftExercisesModel.value = nextRows;
};

const removeExercise = (index: number) => {
  const nextRows = [...draftExercisesModel.value];
  nextRows.splice(index, 1);
  draftExercisesModel.value = nextRows;
};

const cloneLibraryExercise = (exercise: ExerciseResponseDto): DraftExerciseRow | undefined => {
  const exerciseId = exercise._id?.trim();
  if (!exerciseId) return undefined;

  return {
    exercise: exerciseId,
    reps: "Max",
    series: 1,
  };
};

const removeDraftExerciseAt = (index: number) => {
  const nextRows = [...draftExercisesModel.value];
  nextRows.splice(index, 1);
  draftExercisesModel.value = nextRows;
};

const handleLibraryAdd = () => {
  filteredExerciseItems.value = filteredExercises.value;
};

const handleSelectionAdd = (event: { newIndex?: number | null }) => {
  const newIndex = event.newIndex;
  if (typeof newIndex !== "number") return;

  const insertedRow = draftExercisesModel.value[newIndex];
  const insertedExerciseId = insertedRow?.exercise?.trim();
  if (!insertedExerciseId) {
    removeDraftExerciseAt(newIndex);
    return;
  }

  const duplicateIndex = draftExercisesModel.value.findIndex(
    (row, index) => index !== newIndex && row.exercise?.trim() === insertedExerciseId,
  );

  if (duplicateIndex !== -1) {
    removeDraftExerciseAt(newIndex);
  }
};

const getExerciseName = (exerciseId: string | null | undefined) => {
  const match = exerciseLibrary.value.find(
    (exercise) => exercise._id?.trim() === exerciseId?.trim(),
  );
  return match?.name ?? "";
};

const goBackToPlan = async () => {
  await router.push(
    props.traineeId
      ? `/trainer/members/${props.traineeId}/plans/${planIdRef.value}`
      : `/trainer/training-plans/${planIdRef.value}`,
  );
};

const reloadAll = async () => {
  await loadInitialState();
};

const reloadExercises = async () => {
  await loadExercises();
};

const handleSave = async () => {
  draft.value = {
    ...draft.value,
    exercises: draftExercisesModel.value.map((row) => ({
      exercise: row.exercise ?? null,
      reps: String(row.reps ?? "Max"),
      series: Math.max(0, Math.trunc(Number(row.series ?? 1) || 0)),
    })),
  };

  const result = await savePlanDay();
  if (!result.success) return;

  await goBackToPlan();
};

watch(
  () => [props.planId, props.planDayId] as const,
  async ([nextPlanId, nextPlanDayId]) => {
    planIdRef.value = nextPlanId;
    planDayIdRef.value = nextPlanDayId ?? "";
    searchQuery.value = "";
    selectedBodyPart.value = "all";
    exerciseSource.value = "all";
    await loadInitialState();
  },
  { immediate: true },
);
</script>
