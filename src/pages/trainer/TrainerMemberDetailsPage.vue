<template>
  <div class="flex min-h-full min-w-0 flex-1 flex-col gap-2">
    <section
      class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
    >
      <div class="bg-[var(--lgym-note-bg)]">
        <v-tabs v-model="activeTab" color="primary" grow align-tabs="center" class="min-h-[72px]">
            <v-tab
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="min-h-[72px] flex-1 px-4 normal-case font-semibold tracking-normal"
            >
              <div class="flex items-center gap-2">
                <v-icon :icon="tab.icon" size="18" />
                <span>{{ tab.label }}</span>
              </div>
            </v-tab>
        </v-tabs>
      </div>
    </section>

    <section
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
    >
      <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
        <TrainerMemberTrainingsTab
          v-if="activeTab === 'trainings'"
          class="min-h-0 flex-1"
          :trainee-id="traineeId"
          :format-date="formatDate"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberPlansTab
          v-else-if="activeTab === 'plans'"
          class="min-h-0 flex-1"
          :trainee-id="traineeId"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberDietTab
          v-else-if="activeTab === 'diet'"
          class="min-h-0 flex-1"
          :trainee-id="traineeId"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberReportsTab
          v-else-if="activeTab === 'reports'"
          class="min-h-0 flex-1"
          :trainee-id="traineeId"
          :initial-submission-id="requestedSubmissionId"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberMeasurementsTab
          v-else
          class="min-h-0 flex-1"
          :trainee-id="traineeId"
          :format-date="formatDate"
          :format-date-time="formatDateTime"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";

import TrainerMemberDietTab from "../../components/trainer/member-details/TrainerMemberDietTab.vue";
import TrainerMemberMeasurementsTab from "../../components/trainer/member-details/TrainerMemberMeasurementsTab.vue";
import TrainerMemberPlansTab from "../../components/trainer/member-details/TrainerMemberPlansTab.vue";
import TrainerMemberReportsTab from "../../components/trainer/member-details/TrainerMemberReportsTab.vue";
import TrainerMemberTrainingsTab from "../../components/trainer/member-details/TrainerMemberTrainingsTab.vue";
import {
  useTrainerMemberDetails,
  type MemberDetailsTab,
} from "../../composables/useTrainerMemberDetails";

const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();

const traineeId = computed(() => String(route.params.traineeId ?? ""));
const activeTab = ref<MemberDetailsTab>("trainings");
const requestedTab = computed<MemberDetailsTab | null>(() => {
  const tab = String(route.query.tab ?? "").trim();
  return ["trainings", "plans", "diet", "reports", "measurements"].includes(tab)
    ? (tab as MemberDetailsTab)
    : null;
});
const requestedSubmissionId = computed(
  () => String(route.query.submissionId ?? "").trim() || null,
);
const tabs = computed(() => [
  {
    value: "trainings" as const,
    label: t("trainerMemberDetails.tabs.trainings"),
    icon: "mdi-dumbbell",
  },
  {
    value: "plans" as const,
    label: t("trainerMemberDetails.tabs.plans"),
    icon: "mdi-clipboard-list-outline",
  },
  {
    value: "diet" as const,
    label: t("trainerMemberDetails.tabs.diet"),
    icon: "mdi-food-apple-outline",
  },
  {
    value: "reports" as const,
    label: t("trainerMemberDetails.tabs.reports"),
    icon: "mdi-file-chart-outline",
  },
  {
    value: "measurements" as const,
    label: t("trainerMemberDetails.tabs.measurements"),
    icon: "mdi-tape-measure",
  },
]);

const {
  formatDate,
  formatDateTime,
} = useTrainerMemberDetails(traineeId, locale);

watch(
  requestedTab,
  (tab) => {
    if (tab && activeTab.value !== tab) {
      activeTab.value = tab;
    }
  },
  { immediate: true },
);

watch(activeTab, async (tab) => {
  const currentQueryTab = String(route.query.tab ?? "").trim() || null;
  if (currentQueryTab === tab) {
    return;
  }

  const nextQuery: LocationQueryRaw = { ...route.query, tab };
  if (tab !== "reports") {
    delete nextQuery.submissionId;
  }

  await router.replace({ query: nextQuery });
});
</script>
