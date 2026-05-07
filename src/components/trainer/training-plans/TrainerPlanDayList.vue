<template>
  <section class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
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

    <div class="min-h-0 flex-1 px-4 py-4 sm:px-5 lg:px-6">
      <div
        v-if="hasError && !isLoading"
        class="rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-8 text-center"
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
        class="rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-8 text-center text-sm text-[var(--lgym-text-muted)]"
      >
        {{ t("trainerTrainingPlanDetails.planDays.empty") }}
      </div>

      <div v-else class="grid gap-4 xl:grid-cols-2">
        <article
          v-for="item in items"
          :key="item._id || item.name || 'plan-day'"
          class="group flex h-full min-h-[220px] flex-col rounded-2xl border bg-[var(--lgym-note-bg)]/18 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--lgym-note-bg)]/30"
          :class="item._id?.trim() === selectedPlanDayId
            ? 'border-[var(--lgym-primary)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--lgym-primary)_50%,transparent)]'
            : 'border-[var(--lgym-border)]'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <v-chip
                size="x-small"
                :color="item._id?.trim() === selectedPlanDayId ? 'primary' : undefined"
                :variant="item._id?.trim() === selectedPlanDayId ? 'flat' : 'outlined'"
              >
                {{ item._id?.trim() === selectedPlanDayId
                  ? t("trainerTrainingPlanDetails.planDays.badges.selected")
                  : t("trainerTrainingPlanDetails.planDays.badges.available") }}
              </v-chip>

              <h4 class="mt-3 line-clamp-2 text-base font-semibold text-[var(--lgym-text)]">
                {{ item.name || t("trainerTrainingPlanDetails.planDays.fallback.noName") }}
              </h4>
            </div>
          </div>

          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <div class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/76 px-3 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)]">
                {{ t("trainerTrainingPlanDetails.planDays.stats.exercises") }}
              </p>
              <p class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
                {{ item.totalNumberOfExercises ?? 0 }}
              </p>
            </div>

            <div class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/76 px-3 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)]">
                {{ t("trainerTrainingPlanDetails.planDays.stats.series") }}
              </p>
              <p class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
                {{ item.totalNumberOfSeries ?? 0 }}
              </p>
            </div>

            <div class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/76 px-3 py-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lgym-text-soft)]">
                {{ t("trainerTrainingPlanDetails.planDays.stats.lastTraining") }}
              </p>
              <p class="mt-2 text-sm font-medium text-[var(--lgym-text)]">
                {{ formatDate(item.lastTrainingDate) }}
              </p>
            </div>
          </div>

          <div class="mt-4 rounded-xl border border-dashed border-[var(--lgym-border)] px-3 py-3 text-xs leading-5 text-[var(--lgym-text-muted)]">
            {{ t("trainerTrainingPlanDetails.planDays.meta.series", { count: item.totalNumberOfSeries ?? 0 }) }}
            ·
            {{ t("trainerTrainingPlanDetails.planDays.meta.exercises", { count: item.totalNumberOfExercises ?? 0 }) }}
          </div>

          <div class="mt-auto flex flex-wrap gap-2 pt-4">
            <v-btn variant="outlined" color="primary" size="small" @click="$emit('preview', item)">
              {{ t("trainerTrainingPlanDetails.planDays.actions.preview") }}
            </v-btn>
            <v-btn color="primary" size="small" @click="$emit('edit', item)">
              {{ t("trainerTrainingPlanDetails.planDays.actions.edit") }}
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              :loading="deletingPlanDayId === item._id"
              @click="$emit('delete', item)"
            >
              {{ t("trainerTrainingPlanDetails.planDays.actions.delete") }}
            </v-btn>
          </div>
        </article>
      </div>
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
  preview: [value: PlanDayBaseInfoDto];
  edit: [value: PlanDayBaseInfoDto];
  delete: [value: PlanDayBaseInfoDto];
  "create-new": [];
}>();

const { t } = useI18n();
</script>
