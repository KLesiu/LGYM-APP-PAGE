<template>
  <section class="flex min-h-0 min-w-0 w-full flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4">
        <div class="space-y-3">
          <p
            class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]"
          >
            {{ t("trainerInvitations.history.eyebrow") }}
          </p>

          <div>
            <h2 class="text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
              {{ t("trainerInvitations.history.title") }}
            </h2>
            <p
              class="mt-2 max-w-3xl text-sm leading-6 text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerInvitations.history.subtitle") }}
            </p>
          </div>
        </div>

        <div
          class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)] xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center"
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
            class="min-h-10 w-full rounded-md px-4 xl:w-auto"
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
            class="w-full xl:min-w-[140px]"
            @update:model-value="onPageSizeUpdate"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <v-chip
            v-for="filter in statusFilters"
            :key="filter.value"
            :color="statusFilter === filter.value ? 'primary' : undefined"
            :variant="statusFilter === filter.value ? 'flat' : 'outlined'"
            size="default"
            class="cursor-pointer rounded-md font-semibold"
            @click="$emit('update:statusFilter', filter.value)"
          >
            {{ filter.label }}
          </v-chip>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <div class="min-h-0 flex-1 px-0 py-0">
      <div v-if="isMobileLayout" class="border-y border-[var(--lgym-border)]">
        <template v-if="invitations.length > 0">
          <article
            v-for="(item, index) in invitations"
            :key="invitationRowKey(item, index)"
            class="border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0"
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 space-y-1">
                  <p class="break-words text-sm font-semibold text-[var(--lgym-text)]">
                    {{ item.inviteeEmail || "—" }}
                  </p>
                  <p class="break-all text-xs text-[var(--lgym-text-muted)]">
                    {{ item.code || "—" }}
                  </p>
                </div>

                <v-chip
                  :color="statusColor(item.status)"
                  size="small"
                  class="status-chip"
                >
                  {{ statusLabel(item.status) }}
                </v-chip>
              </div>

              <dl class="grid gap-3 sm:grid-cols-2">
                <div class="space-y-1">
                  <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    {{ t("trainerInvitations.history.columns.trainee") }}
                  </dt>
                  <dd class="m-0 text-sm text-[var(--lgym-text)]">
                    {{
                      item.traineeName ||
                      t("trainerInvitations.history.fallback.noTraineeName")
                    }}
                  </dd>
                  <dd class="m-0 break-words text-xs text-[var(--lgym-text-muted)]">
                    {{
                      item.traineeEmail ||
                      t("trainerInvitations.history.fallback.noTraineeEmail")
                    }}
                  </dd>
                </div>

                <div class="space-y-1">
                  <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    {{ t("trainerInvitations.history.columns.sentAt") }}
                  </dt>
                  <dd class="m-0 text-sm text-[var(--lgym-text)]">
                    {{ formatDate(item.createdAt) }}
                  </dd>
                  <dd class="m-0 text-xs text-[var(--lgym-text-muted)]">
                    {{ t("trainerInvitations.history.meta.expiresAt") }}:
                    {{ formatDate(item.expiresAt) }}
                  </dd>
                </div>
              </dl>

              <v-btn
                variant="outlined"
                color="error"
                prepend-icon="mdi-close-circle-outline"
                class="min-h-10 w-full rounded-md px-4 sm:w-auto"
                :loading="isRevoking(item._id)"
                :disabled="!canRevoke(item) || isRevoking(item._id)"
                @click="$emit('revoke', item)"
              >
                {{ t("trainerInvitations.actions.revoke") }}
              </v-btn>
            </div>
          </article>
        </template>

        <div
          v-else
          class="m-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]"
        >
          <div class="mx-auto flex max-w-md flex-col items-center gap-3">
            <div
                class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]"
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
        </div>
      </div>

      <v-data-table-server
        v-else
        class="trainer-invitations-table"
        :headers="headers"
        :items="invitations"
        :items-length="totalCount"
        :items-per-page="pageSize"
        :page="page"
        :loading="isLoading"
        item-value="_id"
        hide-default-footer
        hover
        @update:page="$emit('update:page', $event)"
        @update:items-per-page="onItemsPerPageUpdate"
      >
        <template #item.inviteeEmail="{ item, index }">
          <div
            :key="invitationRowKey(item, index)"
            class="space-y-1 px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5"
          >
            <p class="break-words font-semibold">
              {{ item.inviteeEmail || "—" }}
            </p>
            <p class="break-all text-xs text-[var(--lgym-text-muted)]">
              {{ item.code || "—" }}
            </p>
          </div>
        </template>

        <template #item.trainee="{ item }">
          <div class="space-y-1 px-4 py-4 text-sm lg:px-5">
            <p class="font-semibold text-[var(--lgym-text)]">
              {{
                item.traineeName ||
                t("trainerInvitations.history.fallback.noTraineeName")
              }}
            </p>
            <p class="break-words text-[var(--lgym-text-muted)]">
              {{
                item.traineeEmail ||
                t("trainerInvitations.history.fallback.noTraineeEmail")
              }}
            </p>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <v-chip
              :color="statusColor(item.status)"
              size="small"
              class="status-chip"
            >
              {{ statusLabel(item.status) }}
            </v-chip>
          </div>
        </template>

        <template #item.sentAt="{ item }">
          <div class="space-y-1 px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
            <p>{{ formatDate(item.createdAt) }}</p>
            <p class="text-xs text-[var(--lgym-text-muted)]">
              {{ t("trainerInvitations.history.meta.expiresAt") }}:
              {{ formatDate(item.expiresAt) }}
            </p>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <v-btn
              variant="outlined"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              class="min-h-10 min-w-[132px] rounded-md px-4"
              :loading="isRevoking(item._id)"
              :disabled="!canRevoke(item) || isRevoking(item._id)"
              @click="$emit('revoke', item)"
            >
              {{ t("trainerInvitations.actions.revoke") }}
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
            <div class="mx-auto flex max-w-md flex-col items-center gap-3">
              <div
                class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]"
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
          </div>
        </template>
      </v-data-table-server>
    </div>

    <div class="border-t border-[var(--lgym-border)] px-4 py-4 sm:px-5">
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

        <div class="flex w-full flex-col gap-3 self-end sm:w-auto sm:flex-row">
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="!hasPreviousPage || isLoading"
            @click="$emit('update:page', page - 1)"
          >
            {{ t("trainerInvitations.actions.previous") }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="!hasNextPage || isLoading"
            @click="$emit('update:page', page + 1)"
          >
            {{ t("trainerInvitations.actions.next") }}
          </v-btn>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useI18n } from "vue-i18n";

import type { TrainerInvitationDto } from "../../api/model";
import {
  canRevokeInvitation,
  normalizeInvitationStatus,
  type InvitationStatusFilter,
} from "../../composables/useTrainerInvitations";

type TableHeader = {
  title: string;
  key: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

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
const { lgAndUp } = useDisplay();

const pageSizeOptions = [10, 20, 50];

const isMobileLayout = computed(() => !lgAndUp.value);

const headers = computed<TableHeader[]>(() => [
  {
    title: t("trainerInvitations.history.columns.inviteeEmail"),
    key: "inviteeEmail",
    sortable: false,
  },
  {
    title: t("trainerInvitations.history.columns.trainee"),
    key: "trainee",
    sortable: false,
  },
  {
    title: t("trainerInvitations.history.columns.status"),
    key: "status",
    sortable: false,
  },
  {
    title: t("trainerInvitations.history.columns.sentAt"),
    key: "sentAt",
    sortable: false,
  },
  {
    title: t("trainerInvitations.history.columns.actions"),
    key: "actions",
    sortable: false,
  },
]);

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

const onItemsPerPageUpdate = (value: number) => {
  if (!pageSizeOptions.includes(value)) {
    emit("update:pageSize", value);
    return;
  }

  onPageSizeUpdate(value);
};

const invitationRowKey = (
  invitation: TrainerInvitationDto,
  index: number,
) =>
  invitation._id ??
  invitation.code ??
  invitation.inviteeEmail ??
  `invitation-${index}`;
</script>

<style scoped>
.trainer-invitations-table :deep(.v-table__wrapper) {
  overflow-x: auto;
  overflow-y: visible;
}

.trainer-invitations-table :deep(table) {
  min-width: 100%;
}

.trainer-invitations-table :deep(thead) {
  border-bottom: 1px solid var(--lgym-border);
  background: var(--lgym-table-head-bg);
}

.trainer-invitations-table :deep(th) {
  padding: 0.875rem 1rem;
  color: var(--lgym-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-align: left;
  text-transform: uppercase;
  box-shadow: none;
}

.trainer-invitations-table :deep(th:last-child) {
  padding-right: 1rem;
}

.trainer-invitations-table :deep(td) {
  min-width: 0;
  padding: 0;
  border-bottom: 1px solid var(--lgym-border);
  vertical-align: top;
}

.trainer-invitations-table :deep(tbody tr:hover) {
  background: var(--lgym-table-row-hover);
}

.status-chip {
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.status-chip :deep(.v-chip__content) {
  font-size: 0.72rem;
  font-weight: 600;
}
</style>
