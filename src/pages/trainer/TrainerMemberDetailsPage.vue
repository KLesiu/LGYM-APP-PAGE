<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <section class="border-b border-[var(--lgym-border)] px-1 pb-4">
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-3">
          <v-btn variant="outlined" color="primary" prepend-icon="mdi-arrow-left" @click="goBack">
            {{ t("trainerMemberDetails.actions.back") }}
          </v-btn>
          <v-chip :color="getMemberStatusColor(snapshot?.status)" size="small">
            {{ t(getMemberStatusTranslationKey(snapshot?.status)) }}
          </v-chip>
        </div>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <v-avatar size="72">
              <v-img v-if="snapshot?.avatar" :src="snapshot.avatar" />
              <span v-else class="text-lg font-bold text-[var(--lgym-text)]">
                {{ getInitials(snapshot?.name || snapshot?.email || traineeId) }}
              </span>
            </v-avatar>

            <div class="min-w-0">
              <h2 class="truncate text-2xl font-semibold text-[var(--lgym-text)] sm:text-3xl">
                {{ snapshot?.name || t("trainerMemberDetails.header.fallbackName") }}
              </h2>
              <p class="mt-2 break-all text-sm leading-6 text-[var(--lgym-text-muted)]">
                {{ snapshot?.email || traineeId }}
              </p>
            </div>
          </div>

          <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-2 text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.header.snapshotHint") }}
          </div>
        </div>
      </div>
    </section>

    <section
      class="flex min-h-0 min-w-0 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
    >
      <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
        <div
          class="rounded-[24px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-2 sm:p-3"
        >
          <v-tabs v-model="activeTab" color="primary" grow align-tabs="center">
            <v-tab
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              rounded="xl"
              class="min-h-[50px] px-4 normal-case font-semibold tracking-normal"
            >
              <div class="flex items-center gap-2">
                <v-icon :icon="tab.icon" size="18" />
                <span>{{ tab.label }}</span>
              </div>
            </v-tab>
        </v-tabs>
        </div>
      </div>

      <div class="min-h-0 flex-1 px-6 py-6 lg:px-8 lg:py-8">
        <TrainerMemberOverviewTab
          v-if="activeTab === 'overview'"
          :snapshot="snapshot"
          :overview="overview"
          :is-loading="isLoadingOverview"
          :has-error="hasOverviewError"
          :format-date="formatDate"
          :format-date-time="formatDateTime"
          @retry="loadOverview"
        />

        <TrainerMemberTrainingsTab
          v-else-if="activeTab === 'trainings'"
          :trainee-id="traineeId"
          :format-date="formatDate"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberPlansTab
          v-else-if="activeTab === 'plans'"
          :trainee-id="traineeId"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberReportsTab
          v-else-if="activeTab === 'reports'"
          :trainee-id="traineeId"
          :format-date-time="formatDateTime"
        />

        <TrainerMemberMeasurementsTab
          v-else
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
import { useRoute, useRouter } from "vue-router";

import TrainerMemberMeasurementsTab from "../../components/trainer/member-details/TrainerMemberMeasurementsTab.vue";
import TrainerMemberOverviewTab from "../../components/trainer/member-details/TrainerMemberOverviewTab.vue";
import TrainerMemberPlansTab from "../../components/trainer/member-details/TrainerMemberPlansTab.vue";
import TrainerMemberReportsTab from "../../components/trainer/member-details/TrainerMemberReportsTab.vue";
import TrainerMemberTrainingsTab from "../../components/trainer/member-details/TrainerMemberTrainingsTab.vue";
import {
  useTrainerMemberDetails,
  type MemberDetailsTab,
} from "../../composables/useTrainerMemberDetails";
import {
  getInitials,
  getMemberStatusColor,
  getMemberStatusTranslationKey,
} from "../../composables/useTrainerMembers";

const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();

const traineeId = computed(() => String(route.params.traineeId ?? ""));
const activeTab = ref<MemberDetailsTab>("overview");
const tabs = computed(() => [
  {
    value: "overview" as const,
    label: t("trainerMemberDetails.tabs.overview"),
    icon: "mdi-view-dashboard-outline",
  },
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
  snapshot,
  overview,
  isLoadingOverview,
  hasOverviewError,
  formatDate,
  formatDateTime,
  loadOverview,
} = useTrainerMemberDetails(traineeId, locale);

watch(
  [activeTab, traineeId],
  ([tab]) => {
    if (tab === "overview") {
      void loadOverview();
    }
  },
  { immediate: true },
);

const goBack = async () => {
  await router.push("/trainer/members");
};
</script>
