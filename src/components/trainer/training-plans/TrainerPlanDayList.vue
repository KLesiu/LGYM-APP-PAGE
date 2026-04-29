<template>
  <section class="overflow-hidden border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/40">
    <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 lg:px-6">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerTrainingPlanDetails.planDays.eyebrow") }}
            </p>
            <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
              {{ t("trainerTrainingPlanDetails.planDays.title") }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlanDetails.planDays.subtitle") }}
            </p>
          </div>

          <v-btn
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="isSaving"
            @click="$emit('create-new')"
          >
            {{ t("trainerTrainingPlanDetails.planDays.actions.create") }}
          </v-btn>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <div class="divide-y divide-[var(--lgym-border)]">
      <div
        v-if="hasError && !isLoading"
        class="px-4 py-8 text-center sm:px-5 lg:px-6"
      >
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerTrainingPlanDetails.planDays.error.load") }}
        </p>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="$emit('retry')">
          {{ t("trainerTrainingPlanDetails.actions.retry") }}
        </v-btn>
      </div>

      <div
        v-else-if="items.length === 0"
        class="px-4 py-8 text-center text-sm text-[var(--lgym-text-muted)] sm:px-5 lg:px-6"
      >
        {{ t("trainerTrainingPlanDetails.planDays.empty") }}
      </div>

      <button
        v-for="item in items"
        :key="item._id || item.name || 'plan-day'"
        type="button"
        class="w-full px-4 py-4 text-left transition-colors hover:bg-[var(--lgym-note-bg)]/28 sm:px-5 lg:px-6"
        :class="item._id?.trim() === selectedPlanDayId ? 'bg-[var(--lgym-note-bg)]/42' : ''"
        @click="$emit('open', item)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h4 class="truncate text-sm font-semibold text-[var(--lgym-text)] sm:text-base">
              {{ item.name || t("trainerTrainingPlanDetails.planDays.fallback.noName") }}
            </h4>
            <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--lgym-text-muted)]">
              <span>
                {{ t("trainerTrainingPlanDetails.planDays.meta.exercises", { count: item.totalNumberOfExercises ?? 0 }) }}
              </span>
              <span>
                {{ t("trainerTrainingPlanDetails.planDays.meta.series", { count: item.totalNumberOfSeries ?? 0 }) }}
              </span>
              <span>
                {{ t("trainerTrainingPlanDetails.planDays.meta.lastTraining", { value: formatDate(item.lastTrainingDate) }) }}
              </span>
            </div>
          </div>

          <v-btn
            variant="outlined"
            color="primary"
            size="small"
            @click.stop="$emit('open', item)"
          >
            {{ t("trainerTrainingPlanDetails.planDays.actions.open") }}
          </v-btn>
          <v-btn
            variant="text"
            color="error"
            size="small"
            :loading="deletingPlanDayId === item._id"
            @click.stop="$emit('delete', item)"
          >
            {{ t("trainerTrainingPlanDetails.planDays.actions.delete") }}
          </v-btn>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { PlanDayBaseInfoDto } from "../../../api/model";

defineProps<{
  items: PlanDayBaseInfoDto[];
  isLoading: boolean;
  hasError: boolean;
  isSaving: boolean;
  deletingPlanDayId: string | null;
  selectedPlanDayId: string | null;
  formatDate: (value: string | null | undefined) => string;
}>();

defineEmits<{
  retry: [];
  select: [value: string | null];
  open: [value: PlanDayBaseInfoDto];
  delete: [value: PlanDayBaseInfoDto];
  "create-new": [];
}>();

const { t } = useI18n();
</script>
