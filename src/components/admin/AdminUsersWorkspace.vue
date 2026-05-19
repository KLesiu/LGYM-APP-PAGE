<template>
  <div
    ref="cardRef"
    class="flex min-h-0 min-w-0 w-full flex-col"
  >
    <AppDataSection
      :eyebrow="t('admin.table.sectionEyebrow')"
      :title="`${t('admin.table.user')} & ${t('admin.table.roles')}`"
      :subtitle="t('admin.table.sectionSubtitle')"
      :summary-text="`${t('admin.pagination.summary', { page, totalPages, totalCount: totalUsers })} · ${pageSize} / ${t('admin.table.user')}`"
      :pagination-summary="t('admin.pagination.summary', { page, totalPages, totalCount: totalUsers })"
      :previous-label="t('admin.actions.previous')"
      :next-label="t('admin.actions.next')"
      :disable-previous="page <= 1 || isLoading"
      :disable-next="page >= totalPages || isLoading"
      @previous="$emit('changePage', page - 1)"
      @next="$emit('changePage', page + 1)"
    >
    <div ref="headerRef" class="contents" />
    <div class="min-h-0 flex-1">
      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :items="users"
        :items-length="totalUsers"
        :items-per-page="pageSize"
        :page="page"
        :loading="isLoading"
        server
        item-value="id"
        hide-default-footer
        hover
        @update:page="$emit('changePage', $event)"
      >
        <template #mobile>
          <div class="flex flex-col gap-3 p-4 sm:p-6">
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
                      variant="outlined"
                      class="min-h-10 w-full rounded-md px-4"
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
        </template>

        <template #item.user="{ item, index }">
          <div
            :ref="index === 0 ? setFirstRowRef : undefined"
            :key="userRowKey(toUser(item), index)"
            data-admin-user-row="true"
 class="px-6 py-6"
          >
            <div class="flex items-start gap-4">
              <div
 class="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[var(--lgym-avatar-bg)] text-[var(--lgym-text)] text-base font-bold shadow-[inset_0_1px_0_rgba(232,230,230,0.12)]"
                >
                  {{ getUserInitial(toUser(item)) }}
                </div>

                <div class="min-w-0 space-y-2">
                  <div>
                    <p class="text-[var(--lgym-text)] truncate text-sm font-semibold">
                      {{ toUser(item).name || t("admin.table.unknownName") }}
                    </p>
                    <p class="text-[var(--lgym-text-muted)] mt-1 text-xs">
                      ID: {{ toUser(item).id || "—" }}
                    </p>
                  </div>

                  <div
                    v-if="(toUser(item).roles?.length ?? 0) > 0"
                    class="flex flex-wrap gap-3"
                  >
                    <v-chip
                      v-for="role in toUser(item).roles ?? []"
                      :key="`${toUser(item).id}-${role}`"
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
              <p>{{ toUser(item).email || "—" }}</p>
              <p class="text-[var(--lgym-text-muted)] text-xs">
                {{ formatDate(toUser(item).createdAt) }}
              </p>
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
        <div class="px-6 py-6">
            <div class="flex flex-wrap gap-2">
              <v-chip
                size="small"
                :color="toUser(item).isBlocked ? 'warning' : 'success'"
                class="status-chip"
              >
                {{
                  toUser(item).isBlocked
                    ? t("admin.status.blocked")
                    : t("admin.status.active")
                }}
              </v-chip>
              <v-chip
                v-if="toUser(item).isDeleted"
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
              :model-value="editableRoles[toUser(item).id ?? ''] ?? []"
              :items="availableRoles"
              item-title="label"
              item-value="value"
              multiple
              chips
              closable-chips
              class="role-select"
              :menu-props="{ maxHeight: 300 }"
              :disabled="!toUser(item).id || isSavingRoles(toUser(item).id) || availableRoles.length === 0"
              @update:model-value="(value) => updateEditableRoles(toUser(item).id, value)"
            />
          </div>
        </template>

        <template #item.actions="{ item }">
        <div class="px-6 py-6 pr-7">
            <div class="flex flex-col items-start gap-2">
              <v-btn
                color="primary"
                variant="outlined"
                class="min-h-10 min-w-[148px] rounded-md px-4"
                :loading="isSavingRoles(toUser(item).id)"
                :disabled="!toUser(item).id || isSavingRoles(toUser(item).id) || !hasPendingChanges(toUser(item))"
                @click="saveRolesForUser(toUser(item))"
              >
                {{ t("admin.actions.saveRoles") }}
              </v-btn>

              <p
                v-if="recentlySavedRoleUserId === toUser(item).id && !hasPendingChanges(toUser(item))"
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
      </AppDataTable>
    </div>
    <div ref="paginationRef" class="contents" />
    </AppDataSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue";
import { useI18n } from "vue-i18n";

import type { AdminUserDto } from "../../api/model";
import AppDataSection from "../ui/AppDataSection.vue";
import AppDataTable from "../ui/AppDataTable.vue";

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
const cardRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const tableRef = ref<{ getTableElement: () => HTMLElement | null } | null>(null);

type RefTarget = Element | ComponentPublicInstance | null;

const paginationRef = ref<RefTarget>(null);
const firstRowRef = ref<RefTarget>(null);

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
  const tableElement = tableRef.value?.getTableElement() ?? null;
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

const toUser = (item: unknown) => item as AdminUserDto;

const saveRolesForUser = (user: AdminUserDto) => {
  if (!user.id) {
    return;
  }

  emit("saveRoles", user.id);
};

const getUserInitial = (user: AdminUserDto) => {
  const source = user.name?.trim() || user.email?.trim() || "L";
  return source.charAt(0).toUpperCase();
};

const userRowKey = (user: AdminUserDto, index: unknown) =>
  user.id ??
  user.email ??
  user.name ??
  `user-${typeof index === "number" ? index : Number(index) || 0}`;

defineExpose({
  getRecommendedPageSize,
});
</script>

<style scoped>
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
