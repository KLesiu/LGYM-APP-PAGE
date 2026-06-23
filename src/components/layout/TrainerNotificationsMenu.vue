<template>
  <v-menu location="bottom end" offset="12" :close-on-content-click="false" @update:model-value="handleMenuToggle">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        color="secondary"
        class="rounded-md!"
        :aria-label="t('ui.notifications.openMenu')"
        :title="t('ui.notifications.openMenu')"
      >
        <v-badge :content="badgeContent" :model-value="unreadCount > 0" color="error" offset-x="4" offset-y="4">
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="360" max-width="420" rounded="lg" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="flex items-center justify-between gap-3 border-b border-[var(--lgym-border)] px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-[var(--lgym-text)]">
            {{ t("ui.notifications.title") }}
          </p>
          <p class="text-xs text-[var(--lgym-text-muted)]">
            {{ t("ui.notifications.subtitle") }}
          </p>
        </div>

        <v-btn
          v-if="unreadCount > 0"
          size="small"
          variant="text"
          color="primary"
          :loading="isMarkingAllRead"
          @click="markAllAsRead"
        >
          {{ t("ui.notifications.markAllRead") }}
        </v-btn>
      </div>

      <div class="flex gap-2 px-4 py-3">
        <v-btn
          v-for="tab in tabs"
          :key="tab.value"
          size="small"
          class="flex-1 normal-case"
          :color="activeTab === tab.value ? 'primary' : undefined"
          :variant="activeTab === tab.value ? 'flat' : 'outlined'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </v-btn>
      </div>

      <v-progress-linear v-if="isLoading && !isLoaded" indeterminate color="primary" />

      <div v-if="error && notifications.length === 0" class="px-4 py-6 text-center">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("ui.notifications.error") }}
        </p>
        <v-btn class="mt-4" color="primary" variant="outlined" @click="fetchNotifications">
          {{ t("trainerMemberDetails.actions.retry") }}
        </v-btn>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="px-4 py-8 text-center">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("ui.notifications.empty") }}
        </p>
      </div>

      <v-list v-else density="comfortable" class="py-0">
        <v-list-item
          v-for="notification in filteredNotifications"
          :key="notification._id"
          :active="!notification.isRead"
          :disabled="activeNotificationId === notification._id"
          class="border-t border-[var(--lgym-border)] first:border-t-0"
          @click="handleClick(notification)"
        >
          <template #prepend>
            <v-avatar size="32" :color="notification.isRead ? 'grey-lighten-1' : 'primary'" variant="tonal">
              <v-icon :icon="getNotificationIcon(notification.type)" size="18" />
            </v-avatar>
          </template>

          <v-list-item-title class="whitespace-normal text-sm font-semibold text-[var(--lgym-text)]">
            {{ notification.message || t("ui.notifications.fallbackMessage") }}
          </v-list-item-title>
          <v-list-item-subtitle class="mt-1 whitespace-normal text-xs text-[var(--lgym-text-muted)]">
            {{ getNotificationTypeLabel(notification.type) }} · {{ formatTimestamp(notification.createdAt) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <UnreadNotificationWarningModal
    :notification="warningNotification"
    :is-submitting="isWarningActionPending"
    :format-timestamp="formatTimestamp"
    @navigate="handleWarningNavigate"
    @mark-read="handleWarningMarkAsRead"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, type RouteLocationRaw } from "vue-router";
import { getCurrentUser } from "../../composables/useCurrentUser";
import { useToast } from "../../composables/useToast";
import {
  useTrainerNotifications,
  type TrainerNotificationItem,
} from "../../composables/useTrainerNotifications";
import UnreadNotificationWarningModal from "./UnreadNotificationWarningModal.vue";

const OLD_NOTIFICATION_AGE_MS = 24 * 60 * 60 * 1000;

const { t } = useI18n();
const router = useRouter();
const currentUser = getCurrentUser();
const toast = useToast();

const {
  activeNotificationId,
  activeTab,
  error,
  fetchNotifications,
  filteredNotifications,
  formatTimestamp,
  handleNotificationClick,
  isLoaded,
  isLoading,
  isMarkingAllRead,
  markAsRead,
  markAllAsRead,
  notifications,
  unreadCount,
} = useTrainerNotifications(currentUser?.id ?? "");

const hasInitializedWarning = ref(false);
const isWarningActionPending = ref(false);
const warningNotificationId = ref<string | null>(null);

const isOlderThan24Hours = (createdAt?: string | null) => {
  if (!createdAt) return false;

  const createdAtTimestamp = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtTimestamp)) {
    return false;
  }

  return Date.now() - createdAtTimestamp >= OLD_NOTIFICATION_AGE_MS;
};

const findOldestUnreadNotification = (
  items: TrainerNotificationItem[],
): TrainerNotificationItem | null => {
  let oldestNotification: TrainerNotificationItem | null = null;

  for (const notification of items) {
    if (notification.isRead || !isOlderThan24Hours(notification.createdAt)) {
      continue;
    }

    if (!oldestNotification) {
      oldestNotification = notification;
      continue;
    }

    const oldestTimestamp = new Date(oldestNotification.createdAt ?? "").getTime();
    const candidateTimestamp = new Date(notification.createdAt ?? "").getTime();

    if (!Number.isNaN(candidateTimestamp) && candidateTimestamp < oldestTimestamp) {
      oldestNotification = notification;
    }
  }

  return oldestNotification;
};

const warningNotification = computed(() =>
  notifications.value.find((notification) => notification._id === warningNotificationId.value) ?? null,
);

watch(
  [isLoaded, notifications],
  ([loaded, items]) => {
    if (!loaded || hasInitializedWarning.value) {
      return;
    }

    hasInitializedWarning.value = true;
    warningNotificationId.value = findOldestUnreadNotification(items)?._id ?? null;
  },
  { immediate: true },
);

const tabs = computed(() => [
  { value: "new" as const, label: t("ui.notifications.tabs.new") },
  { value: "read" as const, label: t("ui.notifications.tabs.read") },
  { value: "all" as const, label: t("ui.notifications.tabs.all") },
]);

const badgeContent = computed(() => (unreadCount.value > 99 ? "99+" : unreadCount.value));

const notificationTypeLabels: Record<string, string> = {
  "trainer.invitation.accepted": "ui.notifications.types.invitationAccepted",
  "trainer.invitation.rejected": "ui.notifications.types.invitationRejected",
  ReportSubmissionReceived: "ui.notifications.types.reportSubmissionReceived",
  TrainerRelationshipEnded: "ui.notifications.types.trainerRelationshipEnded",
};

const getNotificationTypeLabel = (type?: string | null) => {
  if (!type) return t("ui.notifications.unknownType");
  const key = notificationTypeLabels[type];
  return key ? t(key) : type;
};

const getNotificationIcon = (type?: string | null) => {
  switch (type) {
    case "trainer.invitation.accepted":
      return "mdi-account-check-outline";
    case "trainer.invitation.rejected":
      return "mdi-account-cancel-outline";
    case "ReportSubmissionReceived":
      return "mdi-file-document-check-outline";
    case "TrainerRelationshipEnded":
      return "mdi-account-remove-outline";
    default:
      return "mdi-bell-outline";
  }
};

const resolveNotificationTarget = (
  notification: TrainerNotificationItem,
): RouteLocationRaw | null => {
  const traineeId = notification.senderUserId?.trim() || "";

  switch (notification.type) {
    case "trainer.invitation.accepted":
      return traineeId
        ? { name: "trainer-member-details", params: { traineeId } }
        : { name: "trainer-members" };
    case "ReportSubmissionReceived": {
      const submissionId =
        notification.redirectUrl?.match(/\/trainer\/report-submissions\/([^/?#]+)/)?.[1] ||
        undefined;

      return traineeId
        ? {
            name: "trainer-member-details",
            params: { traineeId },
            query: {
              tab: "reports",
              ...(submissionId ? { submissionId } : {}),
            },
          }
        : { name: "trainer-members" };
    }
    case "trainer.invitation.rejected":
      return { name: "trainer-invitations" };
    case "TrainerRelationshipEnded":
      return { name: "trainer-members" };
    default: {
      const target = notification.redirectUrl?.trim();
      if (!target) return null;

      const resolved = router.resolve(target);
      return resolved.matched.length > 0 ? target : null;
    }
  }
};

const handleClick = async (notification: TrainerNotificationItem) => {
  await handleNotificationClick(notification, async (clickedNotification) => {
    const target = resolveNotificationTarget(clickedNotification);
    if (target) {
      await router.push(target);
    }
  });
};

const handleWarningMarkAsRead = async () => {
  if (!warningNotification.value || isWarningActionPending.value) {
    return;
  }

  isWarningActionPending.value = true;

  try {
    await markAsRead(warningNotification.value._id);
    await fetchNotifications();
    warningNotificationId.value = null;
  } catch {
    toast.error("ui.notifications.feedback.markReadFailed");
  } finally {
    isWarningActionPending.value = false;
  }
};

const handleWarningNavigate = async () => {
  if (!warningNotification.value || isWarningActionPending.value) {
    return;
  }

  isWarningActionPending.value = true;

  try {
    const success = await handleNotificationClick(
      warningNotification.value,
      async (clickedNotification) => {
        const target = resolveNotificationTarget(clickedNotification);
        if (target) {
          await router.push(target);
        }
      },
    );

    if (success) {
      warningNotificationId.value = null;
    }
  } finally {
    isWarningActionPending.value = false;
  }
};

const handleMenuToggle = (isOpen: boolean) => {
  if (isOpen) {
    void fetchNotifications();
  }
};
</script>
