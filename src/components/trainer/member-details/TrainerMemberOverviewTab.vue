<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <v-card class="overflow-hidden rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
  <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.overview.eyebrow") }}
        </p>
        <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
          {{ t("trainerMemberDetails.overview.title") }}
        </h2>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.overview.subtitle") }}
        </p>
      </div>

      <v-progress-linear v-if="isLoading" indeterminate color="primary" />

  <v-card-text class="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div v-if="hasError && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <div class="mx-auto flex max-w-md flex-col items-center gap-3">
      <div class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]">
              <v-icon icon="mdi-alert-circle-outline" size="26" />
            </div>
            <p class="text-base font-semibold text-[var(--lgym-text)]">
              {{ t("trainerMemberDetails.overview.error.title") }}
            </p>
            <p class="leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.overview.error.subtitle") }}
            </p>
            <v-btn color="primary" variant="outlined" @click="$emit('retry')">
              {{ t("trainerMemberDetails.actions.retry") }}
            </v-btn>
          </div>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.overview.cards.relationship") }}
            </p>
            <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
              {{ relationshipLabel }}
            </p>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ relationshipMeta }}
            </p>
          </article>

          <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.overview.cards.lastTraining") }}
            </p>
            <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
              {{ formatDate(overview.lastTrainingDate) }}
            </p>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.overview.meta.trainingDates") }}
            </p>
          </article>

          <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.overview.cards.activePlan") }}
            </p>
            <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
              {{ overview.activePlan?.name || t("trainerMemberDetails.overview.emptyValue") }}
            </p>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              <template v-if="overview.activePlan?.createdAt">
                {{ formatDateTime(overview.activePlan.createdAt) }}
              </template>
              <template v-else>
                {{ t("trainerMemberDetails.overview.meta.noActivePlan") }}
              </template>
            </p>
          </article>

          <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.overview.cards.latestReport") }}
            </p>
            <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
              {{ latestReportTitle }}
            </p>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ latestReportMeta }}
            </p>
          </article>

          <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.overview.cards.elo") }}
            </p>
            <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
              {{ overview.latestEloPoint?.value ?? t("trainerMemberDetails.overview.emptyValue") }}
            </p>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ formatDate(overview.latestEloPoint?.date) }}
            </p>
          </article>

          <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.overview.cards.mainRecord") }}
            </p>
            <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
              {{ latestRecordTitle }}
            </p>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ latestRecordMeta }}
            </p>
          </article>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type {
  MainRecordResponseDto,
  TrainerDashboardTraineeDto,
} from "../../../api/model";
import type { MemberOverviewState } from "../../../composables/useTrainerMemberDetails";

const props = defineProps<{
  snapshot: TrainerDashboardTraineeDto | null;
  overview: MemberOverviewState;
  isLoading: boolean;
  hasError: boolean;
  formatDate: (value: string | null | undefined) => string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

defineEmits<{
  retry: [];
}>();

const { t } = useI18n();

const relationshipLabel = computed(() => {
  if (props.snapshot?.isLinked) return t("trainerMembers.relationship.linked");
  if (props.snapshot?.hasPendingInvitation) {
    return t("trainerMembers.relationship.pendingInvitation");
  }
  if (props.snapshot?.hasExpiredInvitation) {
    return t("trainerMembers.relationship.expiredInvitation");
  }
  return t("trainerMembers.relationship.noActiveLink");
});

const relationshipMeta = computed(() => {
  const snapshot = props.snapshot;
  if (!snapshot) return t("trainerMemberDetails.overview.meta.noSnapshot");

  return (
    props.formatDateTime(
      snapshot.linkedAt ??
        snapshot.lastInvitationRespondedAt ??
        snapshot.lastInvitationExpiresAt,
    ) || t("trainerMemberDetails.overview.meta.noSnapshot")
  );
});

const latestReportTitle = computed(() => {
  const submission = props.overview.latestReportSubmission;
  return (
    submission?.request?.template?.name ||
    t("trainerMemberDetails.overview.emptyValue")
  );
});

const latestReportMeta = computed(() => {
  const submission = props.overview.latestReportSubmission;
  if (!submission) return t("trainerMemberDetails.overview.meta.noReports");

  return props.formatDateTime(
    submission.submittedAt ??
      submission.request?.submittedAt ??
      submission.request?.createdAt,
  );
});

const formatMainRecordValue = (record: MainRecordResponseDto | null) => {
  if (!record) return t("trainerMemberDetails.overview.emptyValue");

  const unit = record.unit?.displayName || record.unit?.name || "";
  const exercise = record.exercise || t("trainerMemberDetails.overview.meta.noExercise");
  return `${record.weight ?? 0} ${unit}`.trim() + ` · ${exercise}`;
};

const latestRecordTitle = computed(() =>
  formatMainRecordValue(props.overview.latestMainRecord),
);

const latestRecordMeta = computed(() => {
  if (!props.overview.latestMainRecord) {
    return t("trainerMemberDetails.overview.meta.noMainRecords");
  }

  return props.formatDate(props.overview.latestMainRecord.date);
});
</script>
