<template>
  <AppDataSection
    :eyebrow="t('trainerMembers.list.eyebrow')"
    :title="t('trainerMembers.list.title')"
    :subtitle="t('trainerMembers.list.subtitle')"
    :pagination-summary="
      t('trainerMembers.list.pagination.summary', {
        page,
        totalPages,
        totalCount,
      })
    "
    :previous-label="t('trainerMembers.actions.previous')"
    :next-label="t('trainerMembers.actions.next')"
    :disable-previous="!hasPreviousPage || isLoading"
    :disable-next="!hasNextPage || isLoading"
    class="flex-1"
    @previous="emit('update:page', page - 1)"
    @next="emit('update:page', page + 1)"
  >
    <template #controls>
          <v-text-field
            :model-value="searchQuery"
            :label="t('trainerMembers.list.filters.search')"
            :placeholder="t('trainerMembers.list.placeholders.search')"
            prepend-inner-icon="mdi-magnify"
            hide-details
            @update:model-value="emit('update:searchQuery', String($event ?? ''))"
          />

          <v-select
            :model-value="sortBy"
            :items="sortOptions"
            item-title="label"
            item-value="value"
            :label="t('trainerMembers.list.filters.sortBy')"
            hide-details
            @update:model-value="emit('update:sortBy', $event)"
          />

          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-swap-vertical"
            class="min-h-10 rounded-md px-4"
            @click="emit('toggleSortDirection')"
          >
            {{
              sortDirection === "asc"
                ? t("trainerMembers.list.sortDirection.ascending")
                : t("trainerMembers.list.sortDirection.descending")
            }}
          </v-btn>

          <v-select
            :model-value="pageSize"
            :items="pageSizeOptions"
            :label="t('trainerMembers.list.filters.pageSize')"
            hide-details
            class="xl:min-w-[128px]"
            @update:model-value="onPageSizeUpdate"
          />
    </template>

    <template #filters>
          <v-chip
            v-for="filter in statusFilters"
            :key="filter.value"
            :color="statusFilter === filter.value ? 'primary' : undefined"
            :variant="statusFilter === filter.value ? 'flat' : 'outlined'"
            class="cursor-pointer rounded-md font-semibold"
            @click="emit('update:statusFilter', filter.value)"
          >
            {{ filter.label }}
          </v-chip>
    </template>

    <div class="min-h-0 flex-1 px-0 py-0">
      <div v-if="hasLoadError && !isLoading" class="p-4 sm:p-5">
        <div class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <div class="mx-auto flex max-w-md flex-col items-center gap-3">
            <div class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]">
              <v-icon icon="mdi-alert-circle-outline" size="26" />
            </div>
            <p class="text-base font-semibold text-[var(--lgym-text)]">
              {{ t("trainerMembers.list.error.title") }}
            </p>
            <p class="leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMembers.list.error.subtitle") }}
            </p>
            <v-btn color="primary" variant="outlined" @click="emit('retry')">
              {{ t("trainerMembers.actions.retry") }}
            </v-btn>
          </div>
        </div>
      </div>

      <AppDataTable
        v-else
        :headers="headers"
        :items="members"
        :items-length="totalCount"
        :items-per-page="pageSize"
        :page="page"
        :loading="isLoading"
        server
        item-value="_id"
        hide-default-footer
        hover
        @update:page="emit('update:page', $event)"
        @update:items-per-page="onPageSizeUpdate"
      >
        <template #mobile>
          <div class="border-y border-[var(--lgym-border)]">
            <template v-if="members.length > 0">
              <article
                v-for="(item, index) in members"
                :key="memberRowKey(item, index)"
                class="border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0"
              >
                <div class="flex flex-col gap-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <v-avatar size="48">
                        <v-img v-if="item.avatar" :src="item.avatar" />
                        <span v-else class="text-sm font-bold text-[var(--lgym-text)]">
                          {{ getInitials(item.name || item.email) }}
                        </span>
                      </v-avatar>

                      <div class="min-w-0 space-y-1">
                        <p class="truncate text-sm font-semibold text-[var(--lgym-text)]">
                          {{ item.name || t("trainerMembers.list.fallback.noName") }}
                        </p>
                        <p class="break-all text-xs text-[var(--lgym-text-muted)]">
                          {{ item.email || t("trainerMembers.list.fallback.noEmail") }}
                        </p>
                      </div>
                    </div>

                    <v-chip :color="getMemberStatusColor(item.status)" size="small">
                      {{ t(getMemberStatusTranslationKey(item.status)) }}
                    </v-chip>
                  </div>

                  <dl class="grid gap-3 sm:grid-cols-2">
                    <div class="space-y-1">
                      <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                        {{ t("trainerMembers.list.columns.relationship") }}
                      </dt>
                      <dd class="m-0 text-sm text-[var(--lgym-text)]">
                        {{ relationshipLabel(item) }}
                      </dd>
                    </div>

                    <div class="space-y-1">
                      <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                        {{ t("trainerMembers.list.columns.lastUpdate") }}
                      </dt>
                      <dd class="m-0 text-sm text-[var(--lgym-text)]">
                        {{ relationshipDate(item) }}
                      </dd>
                    </div>
                  </dl>

                  <div class="flex flex-col gap-3 sm:flex-row">
                    <v-btn color="primary" variant="outlined" class="min-h-10 rounded-md px-4" @click="emit('openDetails', item)">
                      {{ t("trainerMembers.actions.openDetails") }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="error"
                      class="min-h-10 rounded-md px-4"
                      :disabled="!canUnlinkMember(item) || isUnlinking(item._id)"
                      :loading="isUnlinking(item._id)"
                      @click="emit('unlink', item)"
                    >
                      {{ t("trainerMembers.actions.unlink") }}
                    </v-btn>
                  </div>
                </div>
              </article>
            </template>

            <div
              v-else
              class="m-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]"
            >
              <div class="mx-auto flex max-w-md flex-col items-center gap-3">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]">
                  <v-icon icon="mdi-account-group-outline" size="26" />
                </div>
                <p class="text-base font-semibold text-[var(--lgym-text)]">
                  {{ t("trainerMembers.list.empty.title") }}
                </p>
                <p class="leading-6">
                  {{ t("trainerMembers.list.empty.subtitle") }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <template #item.member="{ item, index }">
          <div :key="memberRowKey(toMember(item), index)" class="flex items-center gap-3 px-4 py-4 lg:px-5">
            <v-avatar size="44">
              <v-img v-if="toMember(item).avatar" :src="toImageSrc(toMember(item).avatar)" />
              <span v-else class="text-sm font-bold text-[var(--lgym-text)]">
                {{ getInitials(toMember(item).name || toMember(item).email) }}
              </span>
            </v-avatar>

            <div class="min-w-0 space-y-1 text-sm">
              <p class="truncate font-semibold text-[var(--lgym-text)]">
                {{ toMember(item).name || t("trainerMembers.list.fallback.noName") }}
              </p>
              <p class="break-all text-[var(--lgym-text-muted)]">
                {{ toMember(item).email || t("trainerMembers.list.fallback.noEmail") }}
              </p>
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="px-4 py-4 lg:px-5">
            <v-chip :color="getMemberStatusColor(toMember(item).status)" size="small">
              {{ t(getMemberStatusTranslationKey(toMember(item).status)) }}
            </v-chip>
          </div>
        </template>

        <template #item.relationship="{ item }">
          <div class="space-y-1 px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
            <p>{{ relationshipLabel(toMember(item)) }}</p>
            <p class="text-xs text-[var(--lgym-text-muted)]">
              {{ relationshipDate(toMember(item)) }}
            </p>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="flex flex-wrap gap-2 px-4 py-4 lg:px-5">
            <v-btn color="primary" variant="outlined" class="min-h-10 rounded-md px-4" @click="emit('openDetails', toMember(item))">
              {{ t("trainerMembers.actions.openDetails") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="error"
              class="min-h-10 rounded-md px-4"
              :disabled="!canUnlinkMember(toMember(item)) || isUnlinking(toMember(item)._id)"
              :loading="isUnlinking(toMember(item)._id)"
              @click="emit('unlink', toMember(item))"
            >
              {{ t("trainerMembers.actions.unlink") }}
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
            <div class="mx-auto flex max-w-md flex-col items-center gap-3">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]">
                <v-icon icon="mdi-account-group-outline" size="26" />
              </div>
              <p class="text-base font-semibold text-[var(--lgym-text)]">
                {{ t("trainerMembers.list.empty.title") }}
              </p>
              <p class="leading-6">
                {{ t("trainerMembers.list.empty.subtitle") }}
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

import type {
  TrainerDashboardTraineeDto,
  TrainerDashboardTraineeDtoStatus,
} from "../../../api/model";
import AppDataTable from "../../ui/AppDataTable.vue";
import AppDataSection from "../../ui/AppDataSection.vue";
import {
  canUnlinkMember,
  getInitials,
  getMemberStatusColor,
  getMemberStatusTranslationKey,
  type MemberStatusFilter,
  type MembersSortDirection,
  type MembersSortField,
} from "../../../composables/useTrainerMembers";

type TableHeader = {
  title: string;
  key: string;
  sortable?: boolean;
};

const props = defineProps<{
  members: TrainerDashboardTraineeDto[];
  isLoading: boolean;
  hasLoadError: boolean;
  searchQuery: string;
  statusFilter: MemberStatusFilter;
  sortBy: MembersSortField;
  sortDirection: MembersSortDirection;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  unlinkingMemberIds: Set<string>;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const emit = defineEmits<{
  "update:searchQuery": [value: string];
  "update:statusFilter": [value: MemberStatusFilter];
  "update:sortBy": [value: MembersSortField];
  "update:page": [value: number];
  "update:pageSize": [value: number];
  toggleSortDirection: [];
  openDetails: [member: TrainerDashboardTraineeDto];
  unlink: [member: TrainerDashboardTraineeDto];
  retry: [];
}>();

const { t } = useI18n();

const pageSizeOptions = [10, 20, 50];

const toMember = (item: unknown) => item as TrainerDashboardTraineeDto;

const statusFilters = computed<
  { label: string; value: MemberStatusFilter }[]
>(() => [
  { label: t("trainerMembers.filters.all"), value: "All" },
  {
    label: t("trainerMembers.status.linked"),
    value: "Linked" as TrainerDashboardTraineeDtoStatus,
  },
  {
    label: t("trainerMembers.status.invitationPending"),
    value: "InvitationPending" as TrainerDashboardTraineeDtoStatus,
  },
  {
    label: t("trainerMembers.status.invitationExpired"),
    value: "InvitationExpired" as TrainerDashboardTraineeDtoStatus,
  },
  {
    label: t("trainerMembers.status.invitationRejected"),
    value: "InvitationRejected" as TrainerDashboardTraineeDtoStatus,
  },
  {
    label: t("trainerMembers.status.invitationAccepted"),
    value: "InvitationAccepted" as TrainerDashboardTraineeDtoStatus,
  },
  {
    label: t("trainerMembers.status.noRelationship"),
    value: "NoRelationship" as TrainerDashboardTraineeDtoStatus,
  },
]);

const sortOptions = computed(() => [
  { label: t("trainerMembers.list.sortOptions.name"), value: "name" },
  {
    label: t("trainerMembers.list.sortOptions.createdAt"),
    value: "createdAt",
  },
  { label: t("trainerMembers.list.sortOptions.status"), value: "status" },
]);

const headers = computed<TableHeader[]>(() => [
  { title: t("trainerMembers.list.columns.member"), key: "member" },
  { title: t("trainerMembers.list.columns.status"), key: "status" },
  {
    title: t("trainerMembers.list.columns.relationship"),
    key: "relationship",
  },
  { title: t("trainerMembers.list.columns.actions"), key: "actions" },
]);

const onPageSizeUpdate = (value: unknown) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) return;

  emit("update:pageSize", parsedValue);
};

const isUnlinking = (id: string | null | undefined) => {
  if (!id) return false;
  return props.unlinkingMemberIds.has(id);
};

const relationshipLabel = (member: TrainerDashboardTraineeDto) => {
  if (member.isLinked) {
    return t("trainerMembers.relationship.linked");
  }

  if (member.hasPendingInvitation) {
    return t("trainerMembers.relationship.pendingInvitation");
  }

  if (member.hasExpiredInvitation) {
    return t("trainerMembers.relationship.expiredInvitation");
  }

  return t("trainerMembers.relationship.noActiveLink");
};

const relationshipDate = (member: TrainerDashboardTraineeDto) =>
  props.formatDateTime(
    member.linkedAt ??
      member.lastInvitationRespondedAt ??
      member.lastInvitationExpiresAt,
  );

const toImageSrc = (value: string | null | undefined) => value ?? undefined;

const memberRowKey = (member: TrainerDashboardTraineeDto, index: unknown) =>
  member._id ??
  `${member.email ?? "member"}-${typeof index === "number" ? index : Number(index) || 0}`;
</script>
