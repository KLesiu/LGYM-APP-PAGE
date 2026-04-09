<template>
  <v-card
    rounded="[32px]"
    class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
  >
    <div class="border-b border-[var(--lgym-border)] px-5 py-5 sm:px-6">
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
              class="text-[var(--lgym-text-muted)] mt-2 max-w-2xl text-sm leading-6"
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
          </div>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <v-card-text class="pa-0">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead
            class="border-b border-[var(--lgym-border)] bg-[var(--lgym-table-head-bg)]"
          >
            <tr>
              <th
                class="text-[var(--lgym-text-muted)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.user") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.email") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.status") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.roles") }}
              </th>
              <th
                class="text-[var(--lgym-text-muted)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {{ t("admin.table.actions") }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!isLoading && users.length === 0">
              <td
                colspan="5"
                class="text-[var(--lgym-text-muted)] px-5 py-12 text-center text-sm"
              >
                {{ t("admin.table.empty") }}
              </td>
            </tr>

            <AdminUserTableRow
              v-for="(user, index) in users"
              :key="user.id ?? user.email ?? user.name ?? `user-${index}`"
              :user="user"
              :editable-roles="editableRoles"
              :available-roles="availableRoles"
              :is-saving="isSavingRoles(user.id)"
              :format-date="formatDate"
              @save-roles="user.id && $emit('saveRoles', user.id)"
              @update-roles="(value) => updateEditableRoles(user.id, value)"
            />
          </tbody>
        </table>
      </div>
    </v-card-text>

    <AdminUserPagination
      :page="page"
      :total-pages="totalPages"
      :total-users="totalUsers"
      :is-loading="isLoading"
      @change-page="$emit('changePage', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
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
  totalPages: number;
  totalUsers: number;
  users: AdminUserDto[];
  availableRoles: RoleOption[];
  editableRoles: Record<string, string[]>;
  isLoading: boolean;
  savingRoleUserIds: Set<string>;
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

const isSavingRoles = (userId: string | null | undefined) =>
  !!userId && props.savingRoleUserIds.has(userId);

const updateEditableRoles = (
  userId: string | null | undefined,
  value: unknown,
) => {
  emit("updateEditableRoles", { userId, value });
};
</script>
