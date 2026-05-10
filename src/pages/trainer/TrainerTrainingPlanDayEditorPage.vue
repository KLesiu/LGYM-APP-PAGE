<template>
  <div class="flex min-h-full min-w-0 flex-col">
    <TrainerTrainingPlanDayWorkspace :plan-id="planId" :plan-day-id="normalizedPlanDayId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import TrainerTrainingPlanDayWorkspace from "../../components/trainer/training-plans/TrainerTrainingPlanDayWorkspace.vue";

const route = useRoute();

const planId = computed(() => String(route.params.planId ?? ""));
const normalizedPlanDayId = computed(() => {
  const value = String(route.params.planDayId ?? "").trim();
  if (!value || value === "new") return undefined;
  return value;
});
</script>
