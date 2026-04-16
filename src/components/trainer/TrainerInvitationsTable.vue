<template>
  <v-card
    rounded="[32px]"
    class="flex h-full min-h-0 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
  >
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-5">
        <div class="space-y-3">
          <p
            class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]"
          >
            {{ t("trainerInvitations.history.eyebrow") }}
          </p>

          <div>
            <h2 class="text-3xl font-semibold text-[var(--lgym-text)]">
              {{ t("trainerInvitations.history.title") }}
            </h2>
            <p
              class="mt-3 max-w-3xl text-sm leading-7 text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.subtitle") }}
            </p>
          </div>
        </div>

        <div
          class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center"
        >
          <v-text-field
            :model-value="searchQuery"
            :label="t('trainerInvitations.history.filters.search')"
            :placeholder="t('trainerInvitations.history.placeholders.search')"
            prepend-inner-icon="mdi-magnify"
            hide-details
            @update:model-value="onSearchUpdate"
          />

          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-sort-calendar-descending"
            class="min-h-11 px-5"
            @click="$emit('toggleSortDirection')"
          >
            {{
              sortDescending
                ? t("trainerInvitations.history.sort.newest")
                : t("trainerInvitations.history.sort.oldest")
            }}
          </v-btn>

          <v-select
            :model-value="pageSize"
            :items="pageSizeOptions"
            :label="t('trainerInvitations.history.filters.pageSize')"
            hide-details
            class="min-w-[140px]"
            @update:model-value="onPageSizeUpdate"
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <v-chip
            v-for="filter in statusFilters"
            :key="filter.value"
            :color="statusFilter === filter.value ? 'primary' : undefined"
            :variant="statusFilter === filter.value ? 'flat' : 'outlined'"
            size="default"
            class="cursor-pointer font-semibold"
            @click="$emit('update:statusFilter', filter.value)"
          >
            {{ filter.label }}
          </v-chip>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <v-card-text class="min-h-0 flex-1 overflow-x-auto px-0 py-0">
      <table class="min-w-full">
        <thead
          class="border-b border-[var(--lgym-border)] bg-[var(--lgym-table-head-bg)]"
        >
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.columns.inviteeEmail") }}
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.columns.trainee") }}
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.columns.status") }}
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.columns.sentAt") }}
            </th>
            <th
              class="px-6 py-4 pr-7 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.columns.actions") }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="!isLoading && invitations.length === 0">
            <td
              colspan="5"
              class="px-6 py-12 text-center text-sm text-[var(--lgym-text-muted)]"
            >
              <div class="mx-auto flex max-w-md flex-col items-center gap-3">
                <div
                  class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]"
                >
                  <v-icon icon="mdi-email-outline" size="26" />
                </div>
                <p class="text-base font-semibold text-[var(--lgym-text)]">
                  {{ t("trainerInvitations.history.empty.title") }}
                </p>
                <p class="leading-6">
                  {{ t("trainerInvitations.history.empty.subtitle") }}
                </p>
              </div>
            </td>
          </tr>

          <tr
            v-for="(invitation, index) in invitations"
            :key="
              invitation._id ??
              invitation.code ??
              invitation.inviteeEmail ??
              `invitation-${index}`
            "
            class="border-b border-[var(--lgym-border)] transition-colors duration-200 hover:bg-[var(--lgym-table-row-hover)]"
          >
            <td class="px-6 py-6 align-top text-sm text-[var(--lgym-text)]">
              <div class="space-y-1">
                <p class="font-semibold">
                  {{ invitation.inviteeEmail || "—" }}
                </p>
                <p class="text-xs text-[var(--lgym-text-muted)]">
                  {{ invitation.code || "—" }}
                </p>
              </div>
            </td>

            <td class="px-6 py-6 align-top text-sm">
              <div class="space-y-1">
                <p class="font-semibold text-[var(--lgym-text)]">
                  {{
                    invitation.traineeName ||
                    t("trainerInvitations.history.fallback.noTraineeName")
                  }}
                </p>
                <p class="text-[var(--lgym-text-muted)]">
                  {{
                    invitation.traineeEmail ||
                    t("trainerInvitations.history.fallback.noTraineeEmail")
                  }}
                </p>
              </div>
            </td>

            <td class="px-6 py-6 align-top">
              <v-chip
                :color="statusColor(invitation.status)"
                size="small"
                class="status-chip"
              >
                {{ statusLabel(invitation.status) }}
              </v-chip>
            </td>

            <td class="px-6 py-6 align-top text-sm text-[var(--lgym-text)]">
              <div class="space-y-1">
                <p>{{ formatDate(invitation.createdAt) }}</p>
                <p class="text-xs text-[var(--lgym-text-muted)]">
                  {{ t("trainerInvitations.history.meta.expiresAt") }}:
                  {{ formatDate(invitation.expiresAt) }}
                </p>
              </div>
            </td>

            <td class="px-6 py-6 pr-7 align-top">
              <v-btn
                variant="outlined"
                color="error"
                prepend-icon="mdi-close-circle-outline"
                class="min-h-11 min-w-[148px] px-5"
                :loading="isRevoking(invitation._id)"
                :disabled="!canRevoke(invitation) || isRevoking(invitation._id)"
                @click="$emit('revoke', invitation)"
              >
                {{ t("trainerInvitations.actions.revoke") }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </v-card-text>

    <div class="border-t border-[var(--lgym-border)] px-6 py-5">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{
            t("trainerInvitations.history.pagination.summary", {
              page,
              totalPages,
              totalCount,
            })
          }}
        </p>

        <div class="flex gap-3 self-end">
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-11 px-5"
            :disabled="!hasPreviousPage || isLoading"
            @click="$emit('update:page', page - 1)"
          >
            {{ t("trainerInvitations.actions.previous") }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-11 px-5"
            :disabled="!hasNextPage || isLoading"
            @click="$emit('update:page', page + 1)"
          >
            {{ t("trainerInvitations.actions.next") }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { TrainerInvitationDto } from "../../api/model";
import {
  canRevokeInvitation,
  normalizeInvitationStatus,
  type InvitationStatusFilter,
} from "../../composables/useTrainerInvitations";

const props = defineProps<{
  invitations: TrainerInvitationDto[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: InvitationStatusFilter;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortDescending: boolean;
  revokingInvitationIds: Set<string>;
  formatDate: (value: string | null | undefined) => string;
}>();

const emit = defineEmits<{
  "update:searchQuery": [value: string];
  "update:statusFilter": [value: InvitationStatusFilter];
  "update:page": [value: number];
  "update:pageSize": [value: number];
  toggleSortDirection: [];
  revoke: [invitation: TrainerInvitationDto];
}>();

const { t } = useI18n();

const pageSizeOptions = [10, 20, 50];

const statusFilters = computed<
  { label: string; value: InvitationStatusFilter }[]
>(() => [
  { label: t("trainerInvitations.filters.all"), value: "All" },
  { label: t("trainerInvitations.filters.pending"), value: "Pending" },
  { label: t("trainerInvitations.filters.accepted"), value: "Accepted" },
  { label: t("trainerInvitations.filters.rejected"), value: "Rejected" },
  { label: t("trainerInvitations.filters.revoked"), value: "Revoked" },
  { label: t("trainerInvitations.filters.expired"), value: "Expired" },
]);

const statusLabel = (status: string | null | undefined) => {
  const normalizedStatus = normalizeInvitationStatus(status);

  if (!normalizedStatus) {
    return t("trainerInvitations.status.unknown");
  }

  return t(`trainerInvitations.status.${normalizedStatus}`, status ?? "—");
};

const statusColor = (status: string | null | undefined) => {
  switch (normalizeInvitationStatus(status)) {
    case "pending":
      return "warning";
    case "accepted":
      return "success";
    case "rejected":
      return "error";
    case "revoked":
      return "secondary";
    case "expired":
      return "default";
    default:
      return "default";
  }
};

const canRevoke = (invitation: TrainerInvitationDto) =>
  canRevokeInvitation(invitation);

const isRevoking = (invitationId: string | null | undefined) =>
  !!invitationId && props.revokingInvitationIds.has(invitationId);

const onSearchUpdate = (value: string | null) => {
  emit("update:searchQuery", value ?? "");
};

const onPageSizeUpdate = (value: number | string | null) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) return;

  emit("update:pageSize", parsedValue);
};
</script>

<style scoped>
.status-chip {
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.status-chip :deep(.v-chip__content) {
  font-size: 0.72rem;
  font-weight: 600;
}
</style>
