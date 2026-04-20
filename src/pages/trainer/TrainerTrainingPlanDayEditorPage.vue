<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <section class="border-b border-[var(--lgym-border)] px-1 pb-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <v-btn variant="outlined" color="primary" prepend-icon="mdi-arrow-left" @click="goBack">
            {{ t("trainerTrainingPlanDayEditor.actions.backToPlan") }}
          </v-btn>
          <h2 class="text-lg font-semibold text-[var(--lgym-text)] sm:text-xl">
            {{ t("trainerTrainingPlanDayEditor.page.title") }}
          </h2>
          <v-chip color="primary" size="small" variant="outlined">
            {{
              normalizedPlanDayId
                ? t("trainerTrainingPlanDayEditor.page.badges.edit")
                : t("trainerTrainingPlanDayEditor.page.badges.create")
            }}
          </v-chip>
        </div>

        <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-2 text-xs text-[var(--lgym-text-muted)]">
          {{ planId }}
        </div>
      </div>
    </section>

    <TrainerTrainingPlanDayWorkspace :plan-id="planId" :plan-day-id="normalizedPlanDayId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import TrainerTrainingPlanDayWorkspace from "../../components/trainer/training-plans/TrainerTrainingPlanDayWorkspace.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const planId = computed(() => String(route.params.planId ?? ""));
const normalizedPlanDayId = computed(() => {
  const value = String(route.params.planDayId ?? "").trim();
  if (!value || value === "new") return undefined;
  return value;
});

const goBack = async () => {
  await router.push(`/trainer/training-plans/${planId.value}`);
};
</script>
