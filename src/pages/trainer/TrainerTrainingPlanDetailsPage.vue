<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <section class="overflow-hidden rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
      <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-3">
            <v-btn variant="outlined" color="primary" prepend-icon="mdi-arrow-left" @click="goBack">
              {{ t("trainerTrainingPlanDetails.actions.back") }}
            </v-btn>
            <v-chip color="primary" size="small" variant="outlined">
              {{ t("trainerTrainingPlanDetails.page.badge") }}
            </v-chip>
          </div>

          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-4xl">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
                {{ t("trainerTrainingPlanDetails.page.eyebrow") }}
              </p>
              <h2 class="mt-2 text-2xl font-semibold text-[var(--lgym-text)] sm:text-[2rem]">
                {{ t("trainerTrainingPlanDetails.page.title") }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                {{ t("trainerTrainingPlanDetails.page.subtitle") }}
              </p>
            </div>

            <div class="rounded-full border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-2 text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerTrainingPlanDetails.page.planIdLabel", { id: planId }) }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <TrainerTrainingPlanDetails :plan-id="planId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import TrainerTrainingPlanDetails from "../../components/trainer/training-plans/TrainerTrainingPlanDetails.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const planId = computed(() => String(route.params.planId ?? ""));

const goBack = async () => {
  await router.push("/trainer/training-plans");
};
</script>
