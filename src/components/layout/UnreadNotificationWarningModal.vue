<template>
  <v-dialog :model-value="Boolean(notification)" persistent max-width="640">
    <v-card
      v-if="notification"
      rounded="xl"
      class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]"
    >
      <div class="border-b border-[var(--lgym-border)] px-6 py-6">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
          {{ t("ui.notifications.warning.eyebrow") }}
        </p>
        <h2 class="mt-3 text-3xl font-semibold text-[var(--lgym-text)]">
          {{ t("ui.notifications.warning.title") }}
        </h2>
        <p class="mt-4 text-base leading-7 text-[var(--lgym-text-muted)]">
          {{ notification.message || t("ui.notifications.fallbackMessage") }}
        </p>
        <p v-if="notification.createdAt" class="mt-4 text-sm text-[var(--lgym-text-muted)]">
          {{ t("ui.notifications.warning.age", { age: formatTimestamp(notification.createdAt) }) }}
        </p>
      </div>

      <v-card-actions class="flex-col items-stretch gap-3 px-6 py-6 sm:flex-row sm:justify-end">
        <v-btn
          color="primary"
          variant="flat"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="emit('navigate')"
        >
          {{ t("ui.notifications.warning.goToNotification") }}
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="emit('mark-read')"
        >
          {{ t("ui.notifications.warning.markAsRead") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TrainerNotificationItem } from "../../composables/useTrainerNotifications";

defineProps<{
  notification: TrainerNotificationItem | null;
  isSubmitting: boolean;
  formatTimestamp: (dateString?: string | null) => string;
}>();

const emit = defineEmits<{
  navigate: [];
  "mark-read": [];
}>();

const { t } = useI18n();
</script>
