<template>
  <div class="border-t border-[var(--lgym-border)] px-6 py-5">
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

      <div class="flex gap-3 self-end">
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
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  page: number;
  totalPages: number;
  totalUsers: number;
  isLoading: boolean;
}>();

defineEmits<{
  changePage: [value: number];
}>();

const { t } = useI18n();
</script>
