<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <section
      class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
    >
      <div class="px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerTrainingPlans.page.eyebrow") }}
          </p>
          <div>
            <h2 class="text-2xl font-semibold text-[var(--lgym-text)] sm:text-[2rem]">
              {{ t("trainerTrainingPlans.page.title") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlans.page.subtitle") }}
            </p>
          </div>
        </div>

        <div class="self-start rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-1.5 text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerTrainingPlans.page.summary") }}
        </div>
      </div>
      </div>
    </section>

    <TrainerTrainingPlansList />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import TrainerTrainingPlansList from "../../components/trainer/training-plans/TrainerTrainingPlansList.vue";

const { t } = useI18n();
</script>
