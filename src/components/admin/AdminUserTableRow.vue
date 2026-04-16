<template>
  <tr
    class="border-b border-[var(--lgym-border)] transition-colors duration-200 hover:bg-[var(--lgym-table-row-hover)]"
  >
    <td class="px-6 py-6 align-top">
      <div class="flex items-start gap-4">
        <div
          class="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[var(--lgym-avatar-bg)] text-[var(--lgym-text)] text-base font-bold shadow-[inset_0_1px_0_rgba(232,230,230,0.12)]"
        >
          {{ getUserInitial(user) }}
        </div>

        <div class="min-w-0 space-y-2">
          <div>
            <p class="text-[var(--lgym-text)] truncate text-sm font-semibold">
              {{ user.name || t("admin.table.unknownName") }}
            </p>
            <p class="text-[var(--lgym-text-muted)] mt-1 text-xs">
              ID: {{ user.id || "—" }}
            </p>
          </div>

          <div
            v-if="(user.roles?.length ?? 0) > 0"
            class="flex flex-wrap gap-3"
          >
            <v-chip
              v-for="role in user.roles ?? []"
              :key="`${user.id}-${role}`"
              size="x-small"
              color="primary"
              class="role-badge font-semibold"
            >
              {{ role }}
            </v-chip>
          </div>
        </div>
      </div>
    </td>

    <td class="text-[var(--lgym-text)] px-6 py-6 align-top text-sm">
      <div class="space-y-1">
        <p>{{ user.email || "—" }}</p>
        <p class="text-[var(--lgym-text-muted)] text-xs">
          {{ formatDate(user.createdAt) }}
        </p>
      </div>
    </td>

    <td class="px-6 py-6 align-top">
      <div class="flex flex-wrap gap-2">
        <v-chip
          size="small"
          :color="user.isBlocked ? 'warning' : 'success'"
          class="status-chip"
        >
          {{
            user.isBlocked
              ? t("admin.status.blocked")
              : t("admin.status.active")
          }}
        </v-chip>
        <v-chip
          v-if="user.isDeleted"
          size="small"
          color="error"
          class="status-chip"
        >
          {{ t("admin.status.deleted") }}
        </v-chip>
      </div>
    </td>

    <td class="min-w-[300px] px-6 py-6 align-top">
      <v-select
        :model-value="editableRoles[user.id ?? ''] ?? []"
        :items="availableRoles"
        item-title="label"
        item-value="value"
        multiple
        chips
        closable-chips
        class="role-select"
        :menu-props="{ maxHeight: 300 }"
        :disabled="!user.id || isSaving || availableRoles.length === 0"
        @update:model-value="(value) => $emit('updateRoles', value)"
      />
    </td>

    <td class="px-6 py-6 pr-7 align-top">
      <div class="flex flex-col items-start gap-2">
        <v-btn
          color="primary"
          :variant="hasPendingChanges ? 'flat' : 'outlined'"
          :prepend-icon="
            isRecentlySaved && !hasPendingChanges
              ? 'mdi-check-circle-outline'
              : 'mdi-content-save-outline'
          "
          class="min-h-11 min-w-[148px] px-5"
          :loading="isSaving"
          :disabled="!user.id || isSaving || !hasPendingChanges"
          @click="user.id && $emit('saveRoles')"
        >
          {{ t("admin.actions.saveRoles") }}
        </v-btn>

        <p
          v-if="isRecentlySaved && !hasPendingChanges"
          class="text-xs font-medium text-[var(--lgym-success)]"
        >
          {{ t("admin.feedback.rolesUpdateSuccess") }}
        </p>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { AdminUserDto } from "../../api/model";

type RoleOption = {
  value: string;
  label: string;
};

defineProps<{
  user: AdminUserDto;
  editableRoles: Record<string, string[]>;
  availableRoles: RoleOption[];
  isSaving: boolean;
  hasPendingChanges: boolean;
  isRecentlySaved: boolean;
  formatDate: (value: string | null | undefined) => string;
}>();

defineEmits<{
  saveRoles: [];
  updateRoles: [value: unknown];
}>();

const { t } = useI18n();

const getUserInitial = (user: AdminUserDto) => {
  const source = user.name?.trim() || user.email?.trim() || "L";
  return source.charAt(0).toUpperCase();
};
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
