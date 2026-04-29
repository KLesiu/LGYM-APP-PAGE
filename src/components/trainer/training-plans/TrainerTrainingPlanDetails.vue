<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
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
      <TrainerPlanSharePanel
        :share-code="shareCode"
        :is-sharing="isSharingPlan"
        @generate="handleShare"
        @copy="copyShareCode"
      />

      <section class="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TrainerPlanDayList
          :items="planDaySummaries"
          :is-loading="isLoadingPlanDays"
          :has-error="hasPlanDaysError"
          :is-saving="false"
          :deleting-plan-day-id="deletingPlanDayId"
          :selected-plan-day-id="null"
          :format-date="formatDate"
          @retry="reloadPlanDays"
          @select="() => undefined"
          @open="openPlanDayEditor"
          @delete="handleDeletePlanDay"
          @create-new="openCreatePlanDayDraft"
        />

        <section class="border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/40">
          <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerTrainingPlanDetails.workspace.eyebrow") }}
            </p>
            <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
              {{ plan?.name || t("trainerTrainingPlans.fallback.noName") }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlanDetails.workspace.subtitle") }}
            </p>
          </div>

          <div class="grid gap-4 px-4 py-4 sm:px-5 lg:px-6 xl:grid-cols-2">
            <div class="border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]/35 px-4 py-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.create.eyebrow") }}
              </p>
              <h4 class="mt-2 text-base font-semibold text-[var(--lgym-text)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.create.title") }}
              </h4>
              <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.create.subtitle") }}
              </p>
              <v-btn class="mt-4 min-h-10 rounded-md px-4" color="primary" @click="openCreatePlanDayDraft">
                {{ t("trainerTrainingPlanDetails.planDays.actions.create") }}
              </v-btn>
            </div>

            <div class="border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]/35 px-4 py-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.edit.eyebrow") }}
              </p>
              <h4 class="mt-2 text-base font-semibold text-[var(--lgym-text)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.edit.title") }}
              </h4>
              <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.edit.subtitle") }}
              </p>
              <div class="mt-4 rounded-md border border-dashed border-[var(--lgym-border)] px-3 py-3 text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerTrainingPlanDetails.workspace.sections.edit.helper") }}
              </div>
            </div>
          </div>
        </section>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { PlanDayBaseInfoDto } from "../../../api/model";
import { formatTrainerDate } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";
import { useTrainerTrainingPlanDetails } from "../../../composables/useTrainerTrainingPlanDetails";
import TrainerPlanDayList from "./TrainerPlanDayList.vue";
import TrainerPlanSharePanel from "./TrainerPlanSharePanel.vue";

const props = defineProps<{
  planId: string;
}>();

const { locale, t } = useI18n();
const toast = useToast();
const router = useRouter();

const planIdRef = {
  get value() {
    return props.planId;
  },
  set value(_: string) {},
};

const {
  plan,
  planDaySummaries,
  shareCode,
  isLoadingPlan,
  hasPlanError,
  isLoadingPlanDays,
  hasPlanDaysError,
  deletingPlanDayId,
  isSharingPlan,
  loadPlan,
  loadPlanDaySummaries,
  deletePlanDay,
  sharePlan,
} = useTrainerTrainingPlanDetails(planIdRef);

const openCreatePlanDayDraft = async () => {
  await router.push(`/trainer/training-plans/${props.planId}/plan-days/new`);
};

const openPlanDayEditor = async (planDay: PlanDayBaseInfoDto) => {
  const planDayId = planDay._id?.trim();
  if (!planDayId) return;
  await router.push(`/trainer/training-plans/${props.planId}/plan-days/${planDayId}`);
};

const handleDeletePlanDay = async (planDay: PlanDayBaseInfoDto) => {
  const planDayId = planDay._id?.trim();
  if (!planDayId) return;

  const confirmed = window.confirm(
    t("trainerTrainingPlanDetails.planDays.actions.deleteConfirm", {
      name: planDay.name || t("trainerTrainingPlanDetails.planDays.fallback.noName"),
    }),
  );
  if (!confirmed) return;

  await deletePlanDay(planDayId);
  await loadPlanDaySummaries(false);
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
  await Promise.all([loadPlan(), loadPlanDaySummaries(false)]);
};

const reloadPlanDays = async () => {
  await loadPlanDaySummaries(false);
};

watch(
  () => props.planId,
  async () => {
    await Promise.all([loadPlan(), loadPlanDaySummaries(false)]);
  },
  { immediate: true },
);

const formatDate = (value: string | null | undefined) =>
  formatTrainerDate(locale.value, value);
</script>
