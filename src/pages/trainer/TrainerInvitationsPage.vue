<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <section
      class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
    >
      <div class="px-6 py-6 lg:px-8 lg:py-7">
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="max-w-3xl space-y-3">
          <p
            class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]"
          >
            {{ t("trainerInvitations.page.eyebrow") }}
          </p>
          <div>
            <h2 class="text-2xl font-semibold text-[var(--lgym-text)] sm:text-[2rem]">
              {{ t("trainerInvitations.page.title") }}
            </h2>
            <p
              class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.page.subtitle") }}
            </p>
          </div>
        </div>

        <div
          class="self-start rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-1.5 text-sm text-[var(--lgym-text-muted)]"
        >
          {{ t("trainerInvitations.page.summary", { totalCount }) }}
        </div>
      </div>
      </div>
    </section>

    <section
      class="grid min-h-0 min-w-0 gap-4 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]"
    >
      <TrainerInvitationFormCard
        ref="formCardRef"
        :default-language="defaultLanguage"
        :default-time-zone="defaultTimeZone"
        :is-submitting="isCreatingInvitation"
        @submit="handleCreateInvitation"
      />

      <TrainerInvitationsTable
        :invitations="invitations"
        :is-loading="isLoadingList"
        :search-query="searchQuery"
        :status-filter="statusFilter"
        :page="page"
        :page-size="pageSize"
        :total-count="totalCount"
        :total-pages="totalPages"
        :has-next-page="hasNextPage"
        :has-previous-page="hasPreviousPage"
        :sort-descending="sortDescending"
        :revoking-invitation-ids="revokingInvitationIds"
        :format-date="formatDateTime"
        @update:search-query="searchQuery = $event"
        @update:status-filter="statusFilter = $event"
        @update:page="page = $event"
        @update:page-size="pageSize = $event"
        @toggle-sort-direction="sortDescending = !sortDescending"
        @revoke="handleRevokeInvitation"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type {
  CreateTrainerInvitationByEmailRequest,
  TrainerInvitationDto,
} from "../../api/model";
import TrainerInvitationFormCard from "../../components/trainer/TrainerInvitationFormCard.vue";
import TrainerInvitationsTable from "../../components/trainer/TrainerInvitationsTable.vue";
import { useTrainerInvitations } from "../../composables/useTrainerInvitations";

type TrainerInvitationFormCardRef = {
  resetForm: () => void;
};

const { t } = useI18n();
const formCardRef = ref<TrainerInvitationFormCardRef | null>(null);

const {
  invitations,
  isLoadingList,
  isCreatingInvitation,
  revokingInvitationIds,
  page,
  pageSize,
  totalCount,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  searchQuery,
  statusFilter,
  sortDescending,
  defaultLanguage,
  defaultTimeZone,
  formatDateTime,
  createInvitation,
  revokeInvitation,
} = useTrainerInvitations();

const handleCreateInvitation = async (
  payload: CreateTrainerInvitationByEmailRequest,
) => {
  const isSuccess = await createInvitation(payload);
  if (isSuccess) {
    formCardRef.value?.resetForm();
  }
};

const handleRevokeInvitation = async (invitation: TrainerInvitationDto) => {
  const inviteeEmail = invitation.inviteeEmail || "—";
  const confirmed = window.confirm(
    t("trainerInvitations.actions.revokeConfirm", {
      email: inviteeEmail,
    }),
  );

  if (!confirmed) return;

  await revokeInvitation(invitation);
};
</script>
