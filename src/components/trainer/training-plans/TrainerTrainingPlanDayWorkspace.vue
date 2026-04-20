<template>
  <div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
    <section
      v-if="hasPlanError && !isLoadingPlan"
      class="border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/40 px-4 py-8 text-center sm:px-5 lg:px-6"
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
      class="border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/40 px-4 py-8 text-center sm:px-5 lg:px-6"
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
      class="flex min-h-0 flex-1 flex-col overflow-hidden border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/35"
    >
      <div class="sticky top-0 z-10 border-b border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/96 px-4 py-3 backdrop-blur-sm sm:px-5 lg:px-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
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

          <div class="flex shrink-0 flex-wrap gap-2">
            <v-btn variant="outlined" color="primary" class="min-h-9 rounded-md px-3" @click="goBackToPlan">
              {{ t("trainerTrainingPlanDayEditor.actions.cancel") }}
            </v-btn>
            <v-btn color="primary" class="min-h-9 rounded-md px-3" :loading="isSaving" @click="handleSave">
              {{ t("trainerTrainingPlanDayEditor.actions.save") }}
            </v-btn>
          </div>
        </div>
      </div>

      <v-progress-linear v-if="isLoadingPlanDay" indeterminate color="primary" />

      <div class="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(280px,0.88fr)_minmax(0,1.12fr)]">
        <section class="flex min-h-0 flex-col overflow-hidden border-b border-[var(--lgym-border)] xl:border-r xl:border-b-0">
          <div class="border-b border-[var(--lgym-border)] px-3 py-3 sm:px-4">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-semibold text-[var(--lgym-text)]">
                {{ t("trainerTrainingPlanDayEditor.library.title") }}
              </h4>
              <span class="text-xs text-[var(--lgym-text-muted)]">{{ filteredExercises.length }}</span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <v-text-field
                v-model="searchQuery"
                :placeholder="t('trainerTrainingPlanDayEditor.library.fields.searchPlaceholder')"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="min-w-[220px] flex-1"
              />
              <v-select
                v-model="selectedBodyPart"
                :items="bodyPartOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="w-[170px] shrink-0"
              />
            </div>

            <div class="mt-2 flex flex-wrap gap-1">
              <v-btn
                v-for="source in sourceOptions"
                :key="source.value"
                :variant="exerciseSource === source.value ? 'flat' : 'outlined'"
                color="primary"
                size="small"
                class="rounded-md px-2.5"
                @click="exerciseSource = source.value"
              >
                {{ t(source.labelKey) }}
              </v-btn>
            </div>
          </div>

          <v-progress-linear v-if="isLoadingExercises" indeterminate color="primary" />

          <div class="min-h-0 flex-1 overflow-y-auto">
            <div v-if="hasExercisesError && !isLoadingExercises" class="px-4 py-6 text-center">
              <p class="text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerTrainingPlanDayEditor.library.error.load") }}
              </p>
              <v-btn class="mt-3" variant="outlined" color="primary" @click="reloadExercises">
                {{ t("trainerTrainingPlanDayEditor.actions.retry") }}
              </v-btn>
            </div>

            <div
              v-else-if="filteredExercises.length === 0"
              class="px-4 py-6 text-center text-sm text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerTrainingPlanDayEditor.library.empty") }}
            </div>

            <div
              v-for="exercise in filteredExercises"
              :key="exercise._id || exercise.name || 'exercise'"
              class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-[var(--lgym-border)] px-3 py-2 text-left transition-colors hover:bg-[var(--lgym-note-bg)]/22 sm:px-4"
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

                <v-btn
                  :icon="hasExerciseInDraft(exercise._id) ? 'mdi-check' : 'mdi-plus'"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="addExercise(exercise)"
                />
            </div>
          </div>
        </section>

        <section class="flex min-h-0 flex-col overflow-hidden bg-[var(--lgym-surface-card)]/18">
          <div class="border-b border-[var(--lgym-border)] px-3 py-3 sm:px-4">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-semibold text-[var(--lgym-text)]">
                {{ t("trainerTrainingPlanDayEditor.selection.title") }}
              </h4>
              <span class="text-xs text-[var(--lgym-text-muted)]">{{ draftExercises.length }}</span>
            </div>

            <div class="mt-3 grid gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <v-text-field
                v-model="draftName"
                :placeholder="t('trainerTrainingPlanDayEditor.basics.fields.namePlaceholder')"
                density="compact"
                variant="outlined"
                hide-details
              />
              <div class="text-xs text-[var(--lgym-text-muted)] xl:text-right">
                {{ t("trainerTrainingPlanDayEditor.selection.summary", { count: draftExercises.length }) }}
              </div>
            </div>
          </div>

          <div class="hidden border-b border-[var(--lgym-border)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)] xl:grid xl:grid-cols-[minmax(0,1fr)_104px_96px_88px] xl:gap-3 sm:px-4">
            <span>{{ t("trainerTrainingPlanDayEditor.selection.title") }}</span>
            <span>{{ t("trainerTrainingPlanDayEditor.selection.fields.reps") }}</span>
            <span>{{ t("trainerTrainingPlanDayEditor.selection.fields.series") }}</span>
            <span class="text-right">#</span>
          </div>

          <div v-if="draftExercises.length === 0" class="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerTrainingPlanDayEditor.selection.empty") }}
          </div>

          <div v-else class="min-h-0 flex-1 overflow-y-auto divide-y divide-[var(--lgym-border)]">
            <article
              v-for="(row, index) in draftExercises"
              :key="`${row.exercise || 'row'}-${index}`"
              class="px-3 py-2 sm:px-4"
            >
              <div class="grid gap-2 xl:grid-cols-[minmax(0,1fr)_104px_96px_88px] xl:items-center xl:gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-[var(--lgym-text)]">
                    {{ getExerciseName(row.exercise) }}
                  </p>
                </div>

                <v-text-field
                  :model-value="row.reps ?? ''"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="updateExerciseField(index, 'reps', String($event ?? ''))"
                />

                <v-text-field
                  :model-value="row.series ?? 1"
                  type="number"
                  min="0"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="updateExerciseField(index, 'series', Number($event ?? 0))"
                />

                <div class="flex items-center justify-end gap-1">
                  <v-btn icon="mdi-arrow-up" size="small" variant="text" :disabled="index === 0" @click="moveExercise(index, 'up')" />
                  <v-btn icon="mdi-arrow-down" size="small" variant="text" :disabled="index === draftExercises.length - 1" @click="moveExercise(index, 'down')" />
                  <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="removeExercise(index)" />
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { ExerciseResponseDto } from "../../../api/model";
import { useTrainerTrainingPlanDayEditor } from "../../../composables/useTrainerTrainingPlanDayEditor";

const props = defineProps<{
  planId: string;
  planDayId?: string;
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
} = useTrainerTrainingPlanDayEditor(planIdRef, planDayIdRef);

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

const sourceOptions = [
  { value: "all", labelKey: "trainerTrainingPlanDayEditor.library.filters.all" },
  { value: "user", labelKey: "trainerTrainingPlanDayEditor.library.filters.user" },
  { value: "global", labelKey: "trainerTrainingPlanDayEditor.library.filters.global" },
] as const;

const exerciseLibrary = computed(() => {
  const combined = new Map<string, ExerciseResponseDto>();

  for (const exercise of [...allExercises.value, ...globalExercises.value]) {
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
  const exerciseId = exercise._id?.trim();
  if (!exerciseId || hasExerciseInDraft(exerciseId)) return;

  draft.value = {
    ...draft.value,
    exercises: [
      ...draftExercises.value,
      {
        exercise: exerciseId,
        reps: "Max",
        series: 1,
      },
    ],
  };
};

const updateExerciseField = (
  index: number,
  field: "reps" | "series",
  value: string | number,
) => {
  const nextRows = [...draftExercises.value];
  nextRows[index] = {
    ...(nextRows[index] ?? { exercise: null, reps: "Max", series: 1 }),
    [field]: field === "series" ? Math.max(0, Math.trunc(Number(value) || 0)) : String(value),
  };

  draft.value = {
    ...draft.value,
    exercises: nextRows,
  };
};

const removeExercise = (index: number) => {
  const nextRows = [...draftExercises.value];
  nextRows.splice(index, 1);
  draft.value = {
    ...draft.value,
    exercises: nextRows,
  };
};

const moveExercise = (index: number, direction: "up" | "down") => {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= draftExercises.value.length) return;

  const nextRows = [...draftExercises.value];
  [nextRows[index], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[index]];
  draft.value = {
    ...draft.value,
    exercises: nextRows,
  };
};

const getExerciseName = (exerciseId: string | null | undefined) => {
  const match =
    allExercises.value.find((exercise) => exercise._id?.trim() === exerciseId?.trim()) ??
    globalExercises.value.find((exercise) => exercise._id?.trim() === exerciseId?.trim());
  return match?.name || t("trainerTrainingPlanDetails.exercises.fallback.noName");
};

const goBackToPlan = async () => {
  await router.push(`/trainer/training-plans/${planIdRef.value}`);
};

const reloadAll = async () => {
  await loadInitialState();
};

const reloadExercises = async () => {
  await loadExercises();
};

const handleSave = async () => {
  const result = await savePlanDay();
  if (!result.success) return;

  if (!isEditing.value && result.createdPlanDayId) {
    await router.replace(`/trainer/training-plans/${planIdRef.value}/plan-days/${result.createdPlanDayId}`);
    return;
  }

  if (!isEditing.value) {
    await goBackToPlan();
  }
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
