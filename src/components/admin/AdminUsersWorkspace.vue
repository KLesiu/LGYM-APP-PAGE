<template>
  <v-card
    ref="cardRef"
    rounded="[32px]"
    class="flex min-h-0 min-w-0 w-full flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
  >
    <div ref="headerRef" class="border-b border-[var(--lgym-border)] px-4 py-5 sm:px-6 sm:py-6">
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
            <h2 class="text-[var(--lgym-text)] text-2xl font-semibold sm:text-3xl">
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
      <div v-if="isMobileLayout" class="flex flex-col gap-3 p-4 sm:p-6">
        <template v-if="users.length > 0">
          <article
            v-for="(item, index) in users"
            :key="userRowKey(item, index)"
            class="overflow-hidden rounded-[24px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4"
          >
            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-4">
                <div
                  class="inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[18px] bg-[var(--lgym-avatar-bg)] text-[var(--lgym-text)] text-base font-bold shadow-[inset_0_1px_0_rgba(232,230,230,0.12)]"
                >
                  {{ getUserInitial(item) }}
                </div>

                <div class="min-w-0 flex-1 space-y-1">
                  <p class="truncate text-sm font-semibold text-[var(--lgym-text)]">
                    {{ item.name || t("admin.table.unknownName") }}
                  </p>
                  <p class="break-words text-sm text-[var(--lgym-text-muted)]">
                    {{ item.email || "—" }}
                  </p>
                  <p class="break-all text-xs text-[var(--lgym-text-soft)]">
                    ID: {{ item.id || "—" }} · {{ formatDate(item.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <v-chip
                  size="small"
                  :color="item.isBlocked ? 'warning' : 'success'"
                  class="status-chip"
                >
                  {{ item.isBlocked ? t("admin.status.blocked") : t("admin.status.active") }}
                </v-chip>
                <v-chip
                  v-if="item.isDeleted"
                  size="small"
                  color="error"
                  class="status-chip"
                >
                  {{ t("admin.status.deleted") }}
                </v-chip>
              </div>

              <div class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("admin.table.roles") }}
                </p>
                <v-select
                  :model-value="editableRoles[item.id ?? ''] ?? []"
                  :items="availableRoles"
                  item-title="label"
                  item-value="value"
                  multiple
                  chips
                  closable-chips
                  class="role-select"
                  :menu-props="{ maxHeight: 300 }"
                  :disabled="!item.id || isSavingRoles(item.id) || availableRoles.length === 0"
                  @update:model-value="(value) => updateEditableRoles(item.id, value)"
                />
              </div>

              <div class="flex flex-col gap-2">
                <v-btn
                  color="primary"
                  :variant="hasPendingChanges(item) ? 'flat' : 'outlined'"
                  :prepend-icon="recentlySavedRoleUserId === item.id && !hasPendingChanges(item) ? 'mdi-check-circle-outline' : 'mdi-content-save-outline'"
                  class="min-h-11 w-full px-5"
                  :loading="isSavingRoles(item.id)"
                  :disabled="!item.id || isSavingRoles(item.id) || !hasPendingChanges(item)"
                  @click="item.id && $emit('saveRoles', item.id)"
                >
                  {{ t("admin.actions.saveRoles") }}
                </v-btn>

                <p
                  v-if="recentlySavedRoleUserId === item.id && !hasPendingChanges(item)"
                  class="text-xs font-medium text-[var(--lgym-success)]"
                >
                  {{ t("admin.feedback.rolesUpdateSuccess") }}
                </p>
              </div>
            </div>
          </article>
        </template>

        <div
          v-else
          class="text-[var(--lgym-text-muted)] rounded-[24px] border border-dashed border-[var(--lgym-border)] px-6 py-12 text-center text-sm"
        >
          {{ t("admin.table.empty") }}
        </div>
      </div>

      <v-data-table-server
        v-else
        ref="tableRef"
        class="admin-users-table"
        :headers="headers"
        :items="users"
        :items-length="totalUsers"
        :items-per-page="pageSize"
        :page="page"
        :loading="isLoading"
        item-value="id"
        hide-default-footer
        hover
        @update:page="$emit('changePage', $event)"
      >
        <template #item.user="{ item, index }">
          <div
            :ref="index === 0 ? setFirstRowRef : undefined"
            :key="userRowKey(item, index)"
            data-admin-user-row="true"
            class="px-6 py-6"
          >
            <div class="flex items-start gap-4">
              <div
                class="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[var(--lgym-avatar-bg)] text-[var(--lgym-text)] text-base font-bold shadow-[inset_0_1px_0_rgba(232,230,230,0.12)]"
              >
                {{ getUserInitial(item) }}
              </div>

              <div class="min-w-0 space-y-2">
                <div>
                  <p class="text-[var(--lgym-text)] truncate text-sm font-semibold">
                    {{ item.name || t("admin.table.unknownName") }}
                  </p>
                  <p class="text-[var(--lgym-text-muted)] mt-1 text-xs">
                    ID: {{ item.id || "—" }}
                  </p>
                </div>

                <div
                  v-if="(item.roles?.length ?? 0) > 0"
                  class="flex flex-wrap gap-3"
                >
                  <v-chip
                    v-for="role in item.roles ?? []"
                    :key="`${item.id}-${role}`"
                    size="x-small"
                    color="primary"
                    class="role-badge font-semibold"
                  >
                    {{ role }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #item.email="{ item }">
          <div class="px-6 py-6 text-sm text-[var(--lgym-text)]">
            <div class="space-y-1">
              <p>{{ item.email || "—" }}</p>
              <p class="text-[var(--lgym-text-muted)] text-xs">
                {{ formatDate(item.createdAt) }}
              </p>
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="px-6 py-6">
            <div class="flex flex-wrap gap-2">
              <v-chip
                size="small"
                :color="item.isBlocked ? 'warning' : 'success'"
                class="status-chip"
              >
                {{
                  item.isBlocked
                    ? t("admin.status.blocked")
                    : t("admin.status.active")
                }}
              </v-chip>
              <v-chip
                v-if="item.isDeleted"
                size="small"
                color="error"
                class="status-chip"
              >
                {{ t("admin.status.deleted") }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #item.roles="{ item }">
          <div class="px-6 py-6 xl:min-w-[300px]">
            <v-select
              :model-value="editableRoles[item.id ?? ''] ?? []"
              :items="availableRoles"
              item-title="label"
              item-value="value"
              multiple
              chips
              closable-chips
              class="role-select"
              :menu-props="{ maxHeight: 300 }"
              :disabled="!item.id || isSavingRoles(item.id) || availableRoles.length === 0"
              @update:model-value="(value) => updateEditableRoles(item.id, value)"
            />
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="px-6 py-6 pr-7">
            <div class="flex flex-col items-start gap-2">
              <v-btn
                color="primary"
                :variant="hasPendingChanges(item) ? 'flat' : 'outlined'"
                :prepend-icon="
                  recentlySavedRoleUserId === item.id && !hasPendingChanges(item)
                    ? 'mdi-check-circle-outline'
                    : 'mdi-content-save-outline'
                "
                class="min-h-11 min-w-[148px] px-5"
                :loading="isSavingRoles(item.id)"
                :disabled="!item.id || isSavingRoles(item.id) || !hasPendingChanges(item)"
                @click="item.id && $emit('saveRoles', item.id)"
              >
                {{ t("admin.actions.saveRoles") }}
              </v-btn>

              <p
                v-if="recentlySavedRoleUserId === item.id && !hasPendingChanges(item)"
                class="text-xs font-medium text-[var(--lgym-success)]"
              >
                {{ t("admin.feedback.rolesUpdateSuccess") }}
              </p>
            </div>
          </div>
        </template>

        <template #no-data>
          <div class="text-[var(--lgym-text-muted)] px-6 py-12 text-center text-sm">
            {{ t("admin.table.empty") }}
          </div>
        </template>
      </v-data-table-server>
    </v-card-text>

    <div ref="paginationRef" class="border-t border-[var(--lgym-border)] px-4 py-5 sm:px-6">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-[var(--lgym-text-muted)] text-sm">
          {{
            t("admin.pagination.summary", {
              page,
              totalPages,
              totalCount: totalUsers,
            })
          }}
        </p>

        <div class="flex w-full flex-col gap-3 self-end sm:w-auto sm:flex-row">
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-11 px-5"
            :disabled="page <= 1 || isLoading"
            @click="$emit('changePage', page - 1)"
          >
            {{ t("admin.actions.previous") }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-11 px-5"
            :disabled="page >= totalPages || isLoading"
            @click="$emit('changePage', page + 1)"
          >
            {{ t("admin.actions.next") }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue";
import { useDisplay } from "vuetify";
import { useI18n } from "vue-i18n";

import type { AdminUserDto } from "../../api/model";

type RoleOption = {
  value: string;
  label: string;
};

type TableHeader = {
  title: string;
  key: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
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
const { lgAndUp } = useDisplay();
const cardRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const tableRef = ref<ComponentPublicInstance | null>(null);

type RefTarget = Element | ComponentPublicInstance | null;

const paginationRef = ref<RefTarget>(null);
const firstRowRef = ref<RefTarget>(null);
const isMobileLayout = computed(() => !lgAndUp.value);

const headers = computed<TableHeader[]>(() => [
  {
    title: t("admin.table.user"),
    key: "user",
    sortable: false,
  },
  {
    title: t("admin.table.email"),
    key: "email",
    sortable: false,
  },
  {
    title: t("admin.table.status"),
    key: "status",
    sortable: false,
  },
  {
    title: t("admin.table.roles"),
    key: "roles",
    sortable: false,
  },
  {
    title: t("admin.table.actions"),
    key: "actions",
    sortable: false,
  },
]);

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
  const tableElement = resolveElement(tableRef.value);
  const tableHeadHeight =
    tableElement?.querySelector("thead")?.getBoundingClientRect().height ?? 0;
  const firstRowHeight =
    resolveElement(firstRowRef.value)?.getBoundingClientRect().height ??
    estimatedRowHeight.value;
  const bodyRows = Array.from(tableElement?.querySelectorAll("tbody tr") ?? []);
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

const getUserInitial = (user: AdminUserDto) => {
  const source = user.name?.trim() || user.email?.trim() || "L";
  return source.charAt(0).toUpperCase();
};

const userRowKey = (user: AdminUserDto, index: number) =>
  user.id ?? user.email ?? user.name ?? `user-${index}`;

defineExpose({
  getRecommendedPageSize,
});
</script>

<style scoped>
.admin-users-table :deep(.v-table__wrapper) {
  overflow-x: auto;
  overflow-y: visible;
}

.admin-users-table :deep(table) {
  min-width: 100%;
}

.admin-users-table :deep(thead) {
  border-bottom: 1px solid var(--lgym-border);
  background: var(--lgym-table-head-bg);
}

.admin-users-table :deep(th) {
  padding: 1rem 1.5rem;
  color: var(--lgym-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-align: left;
  text-transform: uppercase;
  box-shadow: none;
}

.admin-users-table :deep(th:last-child) {
  padding-right: 1.75rem;
}

.admin-users-table :deep(td) {
  padding: 0;
  border-bottom: 1px solid var(--lgym-border);
  vertical-align: top;
}

.admin-users-table :deep(tbody tr:hover) {
  background: var(--lgym-table-row-hover);
}

.role-badge :deep(.v-chip__content),
.status-chip :deep(.v-chip__content) {
  font-size: 0.72rem;
  font-weight: 600;
}

.role-badge {
  border-radius: 999px;
  padding-inline: 0.3rem;
}

.status-chip {
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.role-select :deep(.v-field) {
  border-radius: 18px;
  min-height: var(--lgym-control-height);
}

.role-select :deep(.v-field__input) {
  row-gap: 0.45rem;
}
</style>
