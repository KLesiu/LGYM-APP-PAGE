<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4 flex-1">
    <section
      v-if="hasPlanError && !isLoadingPlan"
      class="border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/40 px-4 py-8 text-center sm:px-5 lg:px-6"
    >
      <p class="text-sm text-[var(--lgym-text-muted)]">
        {{ t("trainerTrainingPlanDetails.error.plan") }}
      </p>
      <v-btn class="mt-4" variant="outlined" color="primary" @click="reloadAll">
        {{ t("trainerTrainingPlanDetails.actions.retry") }}
      </v-btn>
    </section>

    <template v-else>
      <section class="flex min-h-0 min-w-0 flex-col gap-4 flex-1">
        <TrainerPlanSharePanel
          v-if="!isMemberPlanContext"
          class=""
          :share-code="shareCode"
          :is-sharing="isSharingPlan"
          @generate="handleShare"
          @copy="copyShareCode"
        />

        <TrainerPlanDayList
          class="h-full flex-1"
          :items="planDaySummaries"
          :is-loading="isLoadingPlanDays"
          :has-error="hasPlanDaysError"
          :is-saving="false"
          :deleting-plan-day-id="deletingPlanDayId"
          :selected-plan-day-id="highlightedPlanDayId"
          @retry="reloadPlanDays"
          @preview="previewPlanDay"
          @edit="openPlanDayEditor"
          @delete="handleDeletePlanDay"
          @create-new="openCreatePlanDayDraft"
        />
      </section>

      <v-dialog v-model="isPreviewDialogOpen" max-width="980">
        <section class="overflow-hidden rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
  <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0 max-w-3xl">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerTrainingPlanDetails.workspace.preview.eyebrow") }}
                </p>
                <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
                  {{ previewDialogTitle }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                  {{ hasPreviewContext
                    ? t("trainerTrainingPlanDetails.workspace.preview.subtitle")
                    : t("trainerTrainingPlanDetails.workspace.empty.subtitle") }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <v-btn variant="outlined" color="primary" @click="closePreviewDialog">
                  {{ t("trainerTrainingPlanDetails.actions.close") }}
                </v-btn>
                <v-btn v-if="selectedPlanDayId" color="primary" @click="openPlanDayEditorById(selectedPlanDayId)">
                  {{ t("trainerTrainingPlanDetails.planDays.actions.edit") }}
                </v-btn>
              </div>
            </div>
          </div>

          <v-progress-linear v-if="isLoadingSelectedPlanDay" indeterminate color="primary" />

          <div v-if="hasSelectedPlanDayError && !isLoadingSelectedPlanDay" class="px-6 py-8 text-center lg:px-8">
            <p class="text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlanDetails.workspace.preview.error") }}
            </p>
            <v-btn class="mt-4" variant="outlined" color="primary" @click="previewPlanDayById(selectedPlanDayId)">
              {{ t("trainerTrainingPlanDetails.actions.retry") }}
            </v-btn>
          </div>

    <div v-else-if="isPreviewVisible" class="grid gap-4 px-4 py-4 sm:px-5 lg:px-6">
            <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/72 px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerTrainingPlanDetails.workspace.preview.stats.exercises") }}
                </p>
                <p class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">{{ selectedExerciseCount }}</p>
              </div>
      <div class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/72 px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerTrainingPlanDetails.workspace.preview.stats.series") }}
                </p>
                <p class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">{{ selectedSeriesCount }}</p>
              </div>
      <div class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/72 px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerTrainingPlanDetails.workspace.preview.stats.lastTraining") }}
                </p>
                <p class="mt-2 text-sm font-medium text-[var(--lgym-text)]">{{ selectedLastTraining }}</p>
              </div>
            </div>

            <div v-if="selectedExercises.length === 0" class="rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-6 text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlanDetails.workspace.preview.emptyExercises") }}
            </div>

            <div v-else class="grid gap-3">
              <article
                v-for="(exercise, index) in selectedExercises"
                :key="`${exercise.exercise?._id || exercise.exercise?.name || 'exercise'}-${index}`"
        class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]/20 px-4 py-4"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[var(--lgym-text)]">
                      {{ exercise.exercise?.name || t("trainerTrainingPlanDetails.exercises.fallback.noName") }}
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <v-chip v-if="exercise.exercise?.bodyPart?.displayName || exercise.exercise?.bodyPart?.name" size="x-small" variant="outlined">
                        {{ exercise.exercise?.bodyPart?.displayName || exercise.exercise?.bodyPart?.name }}
                      </v-chip>
                      <v-chip size="x-small" color="primary" variant="outlined">
                        {{ t("trainerTrainingPlanDetails.workspace.preview.exerciseMeta.reps", { value: exercise.reps || '—' }) }}
                      </v-chip>
                      <v-chip size="x-small" variant="outlined">
                        {{ t("trainerTrainingPlanDetails.workspace.preview.exerciseMeta.series", { value: exercise.series ?? 0 }) }}
                      </v-chip>
                    </div>
                  </div>

                  <div class="rounded-full border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-1 text-xs font-semibold text-[var(--lgym-text-muted)]">
                    #{{ index + 1 }}
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div v-else class="px-6 py-8 lg:px-8">
            <div class="rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-6 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlanDetails.workspace.empty.helper") }}
            </div>
          </div>
        </section>
      </v-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { PlanDayBaseInfoDto } from "../../../api/model";
import { useConfirmDialog } from "../../../composables/useConfirmDialog";
import { formatTrainerDate } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";
import { useTrainerTrainingPlanDetails } from "../../../composables/useTrainerTrainingPlanDetails";
import TrainerPlanDayList from "./TrainerPlanDayList.vue";
import TrainerPlanSharePanel from "./TrainerPlanSharePanel.vue";

const props = defineProps<{
  planId: string;
  traineeId?: string;
}>();

const { locale, t } = useI18n();
const toast = useToast();
const router = useRouter();
const { confirm } = useConfirmDialog();
const isPreviewDialogOpen = ref(false);

const planIdRef = {
  get value() {
    return props.planId;
  },
  set value(_: string) {},
};

const {
  isMemberPlanContext,
  planDaySummaries,
  selectedPlanDayId,
  selectedPlanDay,
  shareCode,
  isLoadingPlan,
  hasPlanError,
  isLoadingPlanDays,
  hasPlanDaysError,
  isLoadingSelectedPlanDay,
  hasSelectedPlanDayError,
  deletingPlanDayId,
  isSharingPlan,
  loadInitialState,
  loadPlanDaySummaries,
  loadSelectedPlanDay,
  deletePlanDay,
  sharePlan,
} = useTrainerTrainingPlanDetails(planIdRef, {
  get value() {
    return props.traineeId ?? "";
  },
});

const formatDate = (value: string | null | undefined) =>
  formatTrainerDate(locale.value, value);

const selectedPlanDaySummary = computed(
  () =>
    planDaySummaries.value.find(
      (item) => item._id?.trim() === selectedPlanDayId.value,
    ) ?? null,
);

const highlightedPlanDayId = computed(() =>
  isPreviewDialogOpen.value ? selectedPlanDayId.value : null,
);

const selectedExercises = computed(() => selectedPlanDay.value?.exercises ?? []);

const hasPreviewContext = computed(() => Boolean(selectedPlanDayId.value?.trim()));

const isPreviewVisible = computed(
  () =>
    Boolean(selectedPlanDay.value?._id?.trim()) &&
    selectedPlanDay.value?._id?.trim() === selectedPlanDayId.value,
);

const previewDialogTitle = computed(
  () =>
    selectedPlanDay.value?.name ||
    selectedPlanDaySummary.value?.name ||
    t("trainerTrainingPlanDetails.workspace.empty.title"),
);

const selectedExerciseCount = computed(() => selectedExercises.value.length);

const selectedSeriesCount = computed(() =>
  selectedExercises.value.reduce((total, exercise) => total + (exercise.series ?? 0), 0),
);

const selectedLastTraining = computed(() =>
  formatDate(selectedPlanDaySummary.value?.lastTrainingDate),
);

const openCreatePlanDayDraft = async () => {
  await router.push(
    props.traineeId
      ? `/trainer/members/${props.traineeId}/plans/${props.planId}/plan-days/new`
      : `/trainer/training-plans/${props.planId}/plan-days/new`,
  );
};

const openPlanDayEditorById = async (planDayId: string | null) => {
  const normalizedPlanDayId = planDayId?.trim();
  if (!normalizedPlanDayId) return;
  await router.push(
    props.traineeId
      ? `/trainer/members/${props.traineeId}/plans/${props.planId}/plan-days/${normalizedPlanDayId}`
      : `/trainer/training-plans/${props.planId}/plan-days/${normalizedPlanDayId}`,
  );
};

const openPlanDayEditor = async (planDay: PlanDayBaseInfoDto) => {
  await openPlanDayEditorById(planDay._id ?? null);
};

const closePreviewDialog = async () => {
  isPreviewDialogOpen.value = false;
  await loadSelectedPlanDay(null);
};

const previewPlanDayById = async (planDayId: string | null) => {
  const normalizedPlanDayId = planDayId?.trim();
  if (!normalizedPlanDayId) return;
  isPreviewDialogOpen.value = true;
  await loadSelectedPlanDay(normalizedPlanDayId);
};

const previewPlanDay = async (planDay: PlanDayBaseInfoDto) => {
  await previewPlanDayById(planDay._id ?? null);
};

const handleDeletePlanDay = async (planDay: PlanDayBaseInfoDto) => {
  const planDayId = planDay._id?.trim();
  if (!planDayId) return;

  const confirmed = await confirm({
    title: t("trainerTrainingPlanDetails.planDays.actions.delete"),
    description: t("trainerTrainingPlanDetails.planDays.actions.deleteConfirm", {
      name: planDay.name || t("trainerTrainingPlanDetails.planDays.fallback.noName"),
    }),
    confirmLabel: t("trainerTrainingPlanDetails.planDays.actions.delete"),
    cancelLabel: t("trainerTrainingPlans.actions.cancel"),
    confirmColor: "error",
    isDestructive: true,
  });
  if (!confirmed) return;

  await deletePlanDay(planDayId);
};

const handleShare = async () => {
  await sharePlan();
};

const copyShareCode = async () => {
  if (!shareCode.value) return;

  try {
    await navigator.clipboard.writeText(shareCode.value);
    toast.success("trainerTrainingPlanDetails.feedback.copyShareCodeSuccess");
  } catch (error) {
    console.error(error);
    toast.error("trainerTrainingPlanDetails.feedback.copyShareCodeFailed");
  }
};

const reloadAll = async () => {
  isPreviewDialogOpen.value = false;
  await loadInitialState();
};

const reloadPlanDays = async () => {
  await loadPlanDaySummaries(isPreviewDialogOpen.value);
  if (isPreviewDialogOpen.value && selectedPlanDayId.value) {
    await loadSelectedPlanDay(selectedPlanDayId.value);
  }
};

watch(
  () => props.planId,
  async () => {
    isPreviewDialogOpen.value = false;
    await loadInitialState();
  },
  { immediate: true },
);
</script>
