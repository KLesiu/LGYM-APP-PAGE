<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <section
      class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
    >
      <div class="px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerMembers.page.eyebrow") }}
          </p>
          <div>
            <h2 class="text-2xl font-semibold text-[var(--lgym-text)] sm:text-[2rem]">
              {{ t("trainerMembers.page.title") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMembers.page.subtitle") }}
            </p>
          </div>
        </div>

        <div class="self-start rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-1.5 text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMembers.page.summary", { totalCount }) }}
        </div>
      </div>
      </div>
    </section>

    <TrainerMembersTable
      :members="members"
      :is-loading="isLoadingList"
      :has-load-error="hasLoadError"
      :search-query="searchQuery"
      :status-filter="statusFilter"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :page="page"
      :page-size="pageSize"
      :total-count="totalCount"
      :total-pages="totalPages"
      :has-next-page="hasNextPage"
      :has-previous-page="hasPreviousPage"
      :unlinking-member-ids="unlinkingMemberIds"
      :format-date-time="formatDateTime"
      @update:search-query="searchQuery = $event"
      @update:status-filter="statusFilter = $event"
      @update:sort-by="sortBy = $event"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @toggle-sort-direction="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
      @open-details="openDetails"
      @unlink="handleUnlink"
      @retry="refreshMembers"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { TrainerDashboardTraineeDto } from "../../api/model";
import TrainerMembersTable from "../../components/trainer/members/TrainerMembersTable.vue";
import {
  rememberMemberSnapshot,
  useTrainerMembers,
} from "../../composables/useTrainerMembers";

const { t } = useI18n();
const router = useRouter();

const {
  members,
  isLoadingList,
  hasLoadError,
  unlinkingMemberIds,
  page,
  pageSize,
  totalCount,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  searchQuery,
  statusFilter,
  sortBy,
  sortDirection,
  formatDateTime,
  refreshMembers,
  unlinkMember,
} = useTrainerMembers();

const openDetails = async (member: TrainerDashboardTraineeDto) => {
  const traineeId = member._id?.trim();
  if (!traineeId) return;

  rememberMemberSnapshot(member);
  await router.push(`/trainer/members/${traineeId}`);
};

const handleUnlink = async (member: TrainerDashboardTraineeDto) => {
  const confirmed = window.confirm(
    t("trainerMembers.actions.unlinkConfirm", {
      name:
        member.name || member.email || t("trainerMembers.list.fallback.noName"),
    }),
  );

  if (!confirmed) return;
  await unlinkMember(member);
};
</script>
