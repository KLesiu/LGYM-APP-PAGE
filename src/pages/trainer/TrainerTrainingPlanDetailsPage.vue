<template>
  <div class="flex min-h-full min-w-0 flex-col">
    <TrainerTrainingPlanDetails :plan-id="planId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import TrainerTrainingPlanDetails from "../../components/trainer/training-plans/TrainerTrainingPlanDetails.vue";

const route = useRoute();

const planId = computed(() => String(route.params.planId ?? ""));
</script>
