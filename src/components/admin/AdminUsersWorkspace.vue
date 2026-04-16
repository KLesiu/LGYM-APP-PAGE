<template>
  <v-card
    ref="cardRef"
    rounded="[32px]"
    class="flex h-full min-h-0 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
  >
    <div ref="headerRef" class="border-b border-[var(--lgym-border)] px-6 py-6">
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="space-y-2">
          <p
            class="text-[var(--lgym-primary)] text-xs font-semibold uppercase tracking-[0.24em]"
          >
            {{ t("admin.table.sectionEyebrow") }}
          </p>
          <div>
            <h2 class="text-[var(--lgym-text)] text-2xl font-semibold">
              {{ t("admin.table.user") }} &amp; {{ t("admin.table.roles") }}
            </h2>
            <p
              class="text-[var(--lgym-text-muted)] mt-3 max-w-2xl text-sm leading-6"
            >
              {{ t("admin.table.sectionSubtitle") }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 text-sm">
          <div
            class="rounded-full border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-2 text-[var(--lgym-text-muted)]"
          >
            {{
              t("admin.pagination.summary", {
                page,
                totalPages,
                totalCount: totalUsers,
              })
            }}
            <span class="ml-2 text-xs text-[var(--lgym-text-soft)]">
              · {{ pageSize }} / {{ t("admin.table.user") }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <v-card-text class="min-h-0 flex-1 pa-0">
      <div class="h-full overflow-x-auto overflow-y-hidden">
        <table class="min-w-full">
          <thead
            ref="tableHeadRef"
            class="border-b border-[var(--lgym-border)] bg-[var(--lgym-table-head-bg)]"
          >
            <tr>
              <th
                class="text-[var(--lgym-text-muted)] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.user") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.email") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.status") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.roles") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-6 py-4 pr-7 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.actions") }}
              </th>
            </tr>
          </thead>

          <tbody ref="tableBodyRef">
            <tr v-if="!isLoading && users.length === 0">
              <td
                colspan="5"
                class="text-[var(--lgym-text-muted)] px-6 py-12 text-center text-sm"
              >
                {{ t("admin.table.empty") }}
              </td>
            </tr>

            <AdminUserTableRow
              v-for="(user, index) in users"
              :key="user.id ?? user.email ?? user.name ?? `user-${index}`"
              :ref="index === 0 ? setFirstRowRef : undefined"
              :user="user"
              :editable-roles="editableRoles"
              :available-roles="availableRoles"
              :is-saving="isSavingRoles(user.id)"
              :has-pending-changes="hasPendingChanges(user)"
              :is-recently-saved="recentlySavedRoleUserId === user.id"
              :format-date="formatDate"
              @save-roles="user.id && $emit('saveRoles', user.id)"
              @update-roles="(value) => updateEditableRoles(user.id, value)"
            />
          </tbody>
        </table>
      </div>
    </v-card-text>

    <AdminUserPagination
      ref="paginationRef"
      :page="page"
      :total-pages="totalPages"
      :total-users="totalUsers"
      :is-loading="isLoading"
      @change-page="$emit('changePage', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue";
import { useI18n } from "vue-i18n";

import type { AdminUserDto } from "../../api/model";
import AdminUserPagination from "./AdminUserPagination.vue";
import AdminUserTableRow from "./AdminUserTableRow.vue";

type RoleOption = {
  value: string;
  label: string;
};

const props = defineProps<{
  page: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
  users: AdminUserDto[];
  availableRoles: RoleOption[];
  editableRoles: Record<string, string[]>;
  isLoading: boolean;
  savingRoleUserIds: Set<string>;
  recentlySavedRoleUserId: string | null;
  formatDate: (value: string | null | undefined) => string;
}>();

const emit = defineEmits<{
  changePage: [value: number];
  saveRoles: [userId: string];
  updateEditableRoles: [
    payload: { userId: string | null | undefined; value: unknown },
  ];
}>();

const { t } = useI18n();
const cardRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const tableHeadRef = ref<HTMLElement | null>(null);
const tableBodyRef = ref<HTMLElement | null>(null);

type RefTarget = Element | ComponentPublicInstance | null;

const paginationRef = ref<RefTarget>(null);
const firstRowRef = ref<RefTarget>(null);

const isSavingRoles = (userId: string | null | undefined) =>
  !!userId && props.savingRoleUserIds.has(userId);

const normalizeRoles = (roles: string[] | null | undefined) =>
  [...(roles ?? [])].filter(Boolean).sort();

const hasPendingChanges = (user: AdminUserDto) => {
  const userId = user.id ?? "";
  const current = normalizeRoles(user.roles);
  const edited = normalizeRoles(props.editableRoles[userId]);

  if (current.length !== edited.length) return true;

  return current.some((role, index) => role !== edited[index]);
};

const estimatedRowHeight = computed(() => (props.users.length > 0 ? 120 : 112));

const resolveElement = (target: RefTarget) => {
  if (target instanceof HTMLElement) return target;
  if (target instanceof Element) return null;
  return target?.$el instanceof HTMLElement ? target.$el : null;
};

const setFirstRowRef = (value: RefTarget) => {
  firstRowRef.value = value;
};

const getRecommendedPageSize = () => {
  const cardHeight =
    resolveElement(cardRef.value)?.getBoundingClientRect().height ?? 0;
  const headerHeight =
    resolveElement(headerRef.value)?.getBoundingClientRect().height ?? 0;
  const paginationHeight =
    resolveElement(paginationRef.value)?.getBoundingClientRect().height ?? 0;
  const tableHeadHeight =
    resolveElement(tableHeadRef.value)?.getBoundingClientRect().height ?? 0;
  const firstRowHeight =
    resolveElement(firstRowRef.value)?.getBoundingClientRect().height ??
    estimatedRowHeight.value;
  const bodyRows = Array.from(
    tableBodyRef.value?.querySelectorAll("tr") ?? [],
  ).filter((row) => row.children.length > 1);
  const tallestVisibleRow = bodyRows.reduce((maxHeight, row) => {
    const rowHeight = row.getBoundingClientRect().height;
    return Math.max(maxHeight, rowHeight);
  }, firstRowHeight);

  if (!cardHeight || !tallestVisibleRow) {
    return Math.max(1, props.pageSize);
  }

  const availableRowsHeight =
    cardHeight - headerHeight - paginationHeight - tableHeadHeight - 8;

  return Math.max(1, Math.floor(availableRowsHeight / tallestVisibleRow));
};

const updateEditableRoles = (
  userId: string | null | undefined,
  value: unknown,
) => {
  emit("updateEditableRoles", { userId, value });
};

defineExpose({
  getRecommendedPageSize,
});
</script>
