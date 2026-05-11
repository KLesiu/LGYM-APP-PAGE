<template>
  <AppDataSection
    :eyebrow="t('trainerInvitations.history.eyebrow')"
    :title="t('trainerInvitations.history.title')"
    :subtitle="t('trainerInvitations.history.subtitle')"
    :pagination-summary="
      t('trainerInvitations.history.pagination.summary', {
        page,
        totalPages,
        totalCount,
      })
    "
    :previous-label="t('trainerInvitations.actions.previous')"
    :next-label="t('trainerInvitations.actions.next')"
    :disable-previous="!hasPreviousPage || isLoading"
    :disable-next="!hasNextPage || isLoading"
    @previous="$emit('update:page', page - 1)"
    @next="$emit('update:page', page + 1)"
  >
    <template #controls>
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
    </template>

    <template #filters>
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
    </template>

    <div class="min-h-0 flex-1 px-0 py-0">
      <AppDataTable
        :headers="headers"
        :items="invitations"
        :items-length="totalCount"
        :items-per-page="pageSize"
        :page="page"
        :loading="isLoading"
        server
        item-value="_id"
        hide-default-footer
        hover
        @update:page="$emit('update:page', $event)"
        @update:items-per-page="onItemsPerPageUpdate"
      >
        <template #mobile>
          <div class="border-y border-[var(--lgym-border)]">
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
        </template>

        <template #item.inviteeEmail="{ item, index }">
          <div
            :key="invitationRowKey(toInvitation(item), index)"
            class="space-y-1 px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5"
          >
            <p class="break-words font-semibold">
              {{ toInvitation(item).inviteeEmail || "—" }}
            </p>
            <p class="break-all text-xs text-[var(--lgym-text-muted)]">
              {{ toInvitation(item).code || "—" }}
            </p>
          </div>
        </template>

        <template #item.trainee="{ item }">
          <div class="space-y-1 px-4 py-4 text-sm lg:px-5">
            <p class="font-semibold text-[var(--lgym-text)]">
              {{
                toInvitation(item).traineeName ||
                t("trainerInvitations.history.fallback.noTraineeName")
              }}
            </p>
            <p class="break-words text-[var(--lgym-text-muted)]">
              {{
                toInvitation(item).traineeEmail ||
                t("trainerInvitations.history.fallback.noTraineeEmail")
              }}
            </p>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <v-chip
              :color="statusColor(toInvitation(item).status)"
              size="small"
              class="status-chip"
            >
              {{ statusLabel(toInvitation(item).status) }}
            </v-chip>
          </div>
        </template>

        <template #item.sentAt="{ item }">
          <div class="space-y-1 px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
            <p>{{ formatDate(toInvitation(item).createdAt) }}</p>
            <p class="text-xs text-[var(--lgym-text-muted)]">
              {{ t("trainerInvitations.history.meta.expiresAt") }}:
              {{ formatDate(toInvitation(item).expiresAt) }}
            </p>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <v-btn
              variant="outlined"
              color="error"
              class="min-h-10 min-w-[132px] rounded-md px-4"
              :loading="isRevoking(toInvitation(item)._id)"
              :disabled="!canRevoke(toInvitation(item)) || isRevoking(toInvitation(item)._id)"
              @click="$emit('revoke', toInvitation(item))"
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
      </AppDataTable>
    </div>
  </AppDataSection>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { TrainerInvitationDto } from "../../api/model";
import AppDataTable from "../ui/AppDataTable.vue";
import AppDataSection from "../ui/AppDataSection.vue";
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

const pageSizeOptions = [10, 20, 50];

const toInvitation = (item: unknown) => item as TrainerInvitationDto;

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
  index: unknown,
) =>
  invitation._id ??
  invitation.code ??
  invitation.inviteeEmail ??
  `invitation-${typeof index === "number" ? index : Number(index) || 0}`;
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
