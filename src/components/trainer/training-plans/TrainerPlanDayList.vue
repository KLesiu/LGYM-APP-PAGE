<template>
  <section class="flex min-h-0 min-w-0 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
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

    <div class="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-5 lg:px-6">
      <div
        v-if="hasError && !isLoading"
        class="flex min-h-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-8 text-center"
      >
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerTrainingPlanDetails.planDays.error.load") }}
        </p>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="$emit('retry')">
          {{ t("trainerTrainingPlanDetails.actions.retry") }}
        </v-btn>
      </div>

      <div
        v-else-if="!isLoading && items.length === 0"
        class="flex min-h-full flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-8 text-center text-sm text-[var(--lgym-text-muted)]"
      >
        {{ t("trainerTrainingPlanDetails.planDays.empty") }}
      </div>

      <AppDataTable
        v-else
        :headers="headers"
        :items="items"
        :loading="isLoading"
        :items-per-page="-1"
        item-value="_id"
        hide-default-footer
        hover
      >
        <template #mobile>
          <div class="border-y border-[var(--lgym-border)]">
            <article
              v-for="(item, index) in items"
              :key="item._id || item.name || `plan-day-${index}`"
              class="border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0"
            >
              <div class="flex flex-col gap-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="text-sm font-semibold text-[var(--lgym-text)]">
                        {{ item.name || t("trainerTrainingPlanDetails.planDays.fallback.noName") }}
                      </p>
                      <v-chip
                        size="x-small"
                        :color="item._id?.trim() === selectedPlanDayId ? 'primary' : undefined"
                        :variant="item._id?.trim() === selectedPlanDayId ? 'flat' : 'outlined'"
                      >
                        {{ item._id?.trim() === selectedPlanDayId
                          ? t("trainerTrainingPlanDetails.planDays.badges.selected")
                          : t("trainerTrainingPlanDetails.planDays.badges.available") }}
                      </v-chip>
                    </div>
                    <p class="mt-2 text-xs text-[var(--lgym-text-muted)]">
                      {{ t("trainerTrainingPlanDetails.planDays.meta.exercises", { count: item.totalNumberOfExercises ?? 0 }) }}
                      ·
                      {{ t("trainerTrainingPlanDetails.planDays.meta.series", { count: item.totalNumberOfSeries ?? 0 }) }}
                    </p>
                  </div>
                </div>

                <dl class="grid gap-3 sm:grid-cols-2">
                  <div class="space-y-1">
                    <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerTrainingPlanDetails.planDays.stats.exercises") }}
                    </dt>
                    <dd class="m-0 text-sm text-[var(--lgym-text)]">
                      {{ item.totalNumberOfExercises ?? 0 }}
                    </dd>
                  </div>

                  <div class="space-y-1">
                    <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerTrainingPlanDetails.planDays.stats.series") }}
                    </dt>
                    <dd class="m-0 text-sm text-[var(--lgym-text)]">
                      {{ item.totalNumberOfSeries ?? 0 }}
                    </dd>
                  </div>
                </dl>

                <div class="flex flex-wrap gap-2">
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
              </div>
            </article>
          </div>
        </template>

        <template #item.name="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-[var(--lgym-text)]">
                {{ toPlanDay(item).name || t("trainerTrainingPlanDetails.planDays.fallback.noName") }}
              </p>
              <v-chip
                size="x-small"
                :color="toPlanDay(item)._id?.trim() === selectedPlanDayId ? 'primary' : undefined"
                :variant="toPlanDay(item)._id?.trim() === selectedPlanDayId ? 'flat' : 'outlined'"
              >
                {{ toPlanDay(item)._id?.trim() === selectedPlanDayId
                  ? t("trainerTrainingPlanDetails.planDays.badges.selected")
                  : t("trainerTrainingPlanDetails.planDays.badges.available") }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #item.exercises="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <p class="font-semibold text-[var(--lgym-text)]">
              {{ toPlanDay(item).totalNumberOfExercises ?? 0 }}
            </p>
          </div>
        </template>

        <template #item.series="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <p class="font-semibold text-[var(--lgym-text)]">
              {{ toPlanDay(item).totalNumberOfSeries ?? 0 }}
            </p>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="flex items-center justify-end gap-1 px-4 py-4 lg:px-5">
            <v-btn variant="outlined" color="primary" size="small" @click.stop="$emit('preview', toPlanDay(item))">
              {{ t("trainerTrainingPlanDetails.planDays.actions.preview") }}
            </v-btn>
            <v-btn color="primary" size="small" @click.stop="$emit('edit', toPlanDay(item))">
              {{ t("trainerTrainingPlanDetails.planDays.actions.edit") }}
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              size="small"
              :loading="deletingPlanDayId === toPlanDay(item)._id"
              @click.stop="$emit('delete', toPlanDay(item))"
            >
              {{ t("trainerTrainingPlanDetails.planDays.actions.delete") }}
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8">
            {{ t("trainerTrainingPlanDetails.planDays.empty") }}
          </div>
        </template>
      </AppDataTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { PlanDayBaseInfoDto } from "../../../api/model";
import AppDataTable from "../../ui/AppDataTable.vue";

defineProps<{
  items: PlanDayBaseInfoDto[];
  isLoading: boolean;
  hasError: boolean;
  isSaving: boolean;
  deletingPlanDayId: string | null;
  selectedPlanDayId: string | null;
}>();

defineEmits<{
  retry: [];
  preview: [value: PlanDayBaseInfoDto];
  edit: [value: PlanDayBaseInfoDto];
  delete: [value: PlanDayBaseInfoDto];
  "create-new": [];
}>();

const { t } = useI18n();

const headers = computed(() => [
  {
    title: t("trainerTrainingPlanDetails.planDays.title"),
    key: "name",
    sortable: false,
  },
  {
    title: t("trainerTrainingPlanDetails.planDays.stats.exercises"),
    key: "exercises",
    sortable: false,
  },
  {
    title: t("trainerTrainingPlanDetails.planDays.stats.series"),
    key: "series",
    sortable: false,
  },
  {
    title: t("trainerTrainingPlanDetails.planDays.columns.actions"),
    key: "actions",
    sortable: false,
    align: "end" as const,
  },
]);

const toPlanDay = (item: unknown) => item as PlanDayBaseInfoDto;
</script>
