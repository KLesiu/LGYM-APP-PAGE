import { computed, onBeforeUnmount, ref, watch } from "vue";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import {
  getApiIdNotifications,
  postApiIdNotificationsMarkAllRead,
  postApiIdNotificationsNotificationIdMarkRead,
} from "../api/generated/demo";
import type {
  InAppNotificationResultDto,
  PagedNotificationsResultDto,
} from "../api/model";
import { getApiBaseUrl } from "../config/runtimeConfig";
import { getAuthToken } from "./useAuthSession";
import { useToast } from "./useToast";

type TrainerNotificationTab = "new" | "read" | "all";

export type TrainerNotificationItem = InAppNotificationResultDto & {
  _id: string;
};

const TRAINER_NOTIFICATION_TYPES = new Set([
  "trainer.invitation.accepted",
  "trainer.invitation.rejected",
  "ReportSubmissionReceived",
  "TrainerRelationshipEnded",
]);

const apiBaseUrl = getApiBaseUrl();

const isTrainerNotificationType = (type?: string | null) =>
  !!type && TRAINER_NOTIFICATION_TYPES.has(type);

const getNotificationDeduplicationKey = (notification: TrainerNotificationItem) =>
  notification._id;

const formatTimestamp = (dateString?: string | null) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  } catch {
    return "";
  }
};

const mapNotification = (
  notification: InAppNotificationResultDto,
): TrainerNotificationItem => ({
  ...notification,
  _id: notification._id || "",
});

export function useTrainerNotifications(userId: string) {
  const toast = useToast();
  const notifications = ref<TrainerNotificationItem[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);
  const activeTab = ref<TrainerNotificationTab>("new");
  const isMarkingAllRead = ref(false);
  const activeNotificationId = ref<string | null>(null);
  let hubConnection: HubConnection | null = null;
  let startPollingPromise: Promise<void> | null = null;

  const getCurrentUserId = () => userId.trim();

  const mergeNotifications = (items: TrainerNotificationItem[]) => {
    notifications.value = Array.from(
      new Map(
        items
          .filter((notification) => !!notification._id)
          .filter((notification) => isTrainerNotificationType(notification.type))
          .map((notification) => [
            getNotificationDeduplicationKey(notification),
            notification,
          ]),
      ).values(),
    ).sort(
      (left, right) =>
        new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime(),
    );
  };

  const handleIncomingNotification = (
    incomingNotification: InAppNotificationResultDto | null | undefined,
  ) => {
    if (!incomingNotification) return;

    const mappedNotification = mapNotification(incomingNotification);
    if (!mappedNotification._id || !isTrainerNotificationType(mappedNotification.type)) {
      return;
    }

    mergeNotifications([mappedNotification, ...notifications.value]);
    isLoaded.value = true;
    error.value = null;
  };

  const fetchNotifications = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      notifications.value = [];
      error.value = null;
      isLoaded.value = true;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const allItems: TrainerNotificationItem[] = [];
      let hasNextPage = true;
      let cursorCreatedAt: string | undefined;
      let cursorId: string | undefined;
      const visitedCursors = new Set<string>();

      while (hasNextPage) {
        const cursorKey = `${cursorCreatedAt ?? "start"}:${cursorId ?? "start"}`;
        if (visitedCursors.has(cursorKey)) break;
        visitedCursors.add(cursorKey);

          const response = await getApiIdNotifications(currentUserId, {
            Limit: 50,
            CursorCreatedAt: cursorCreatedAt,
            CursorId: cursorId,
        });

        if (response.status !== 200) {
          throw new Error("Failed to load notifications");
        }

        const payload = response.data as PagedNotificationsResultDto;
        const pageItems = (payload.items ?? []).map(mapNotification);
        allItems.push(...pageItems);

        hasNextPage = payload.hasNextPage ?? false;
        cursorCreatedAt = payload.nextCursorCreatedAt ?? undefined;
        cursorId = payload.nextCursorId ?? undefined;
      }

      mergeNotifications(allItems);
      isLoaded.value = true;
    } catch (fetchError) {
      error.value =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load notifications";
    } finally {
      isLoading.value = false;
    }
  };

  const unreadCount = computed(
    () => notifications.value.filter((notification) => !notification.isRead).length,
  );

  const filteredNotifications = computed(() => {
    if (activeTab.value === "all") return notifications.value;

    return notifications.value.filter((notification) =>
      activeTab.value === "new" ? !notification.isRead : !!notification.isRead,
    );
  });

  const markAsRead = async (notificationId: string) => {
    await postApiIdNotificationsNotificationIdMarkRead(getCurrentUserId(), notificationId);
  };

  const markAllAsRead = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    isMarkingAllRead.value = true;
    try {
      const response = await postApiIdNotificationsMarkAllRead(currentUserId);
      if (response.status !== 200) {
        throw new Error("Failed to mark all notifications as read");
      }
      await fetchNotifications();
    } catch {
      toast.error("ui.notifications.feedback.markAllReadFailed");
    } finally {
      isMarkingAllRead.value = false;
    }
  };

  const handleNotificationClick = async (
    notification: TrainerNotificationItem,
    onNavigate?: (notification: TrainerNotificationItem) => Promise<void> | void,
  ) => {
    activeNotificationId.value = notification._id;

    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      await fetchNotifications();

      if (onNavigate) {
        await onNavigate(notification);
      }

      return true;
    } catch {
      toast.error("ui.notifications.feedback.markReadFailed");
      return false;
    } finally {
      activeNotificationId.value = null;
    }
  };

  const stopPolling = () => {
    startPollingPromise = null;

    if (hubConnection) {
      const currentConnection = hubConnection;
      hubConnection = null;
      void currentConnection.stop();
    }
  };

  const startPolling = async () => {
    if (startPollingPromise) {
      return startPollingPromise;
    }

    const currentUserId = getCurrentUserId();

    if (typeof window === "undefined" || !currentUserId) return;

    if (
      hubConnection &&
      (hubConnection.state === HubConnectionState.Connected ||
        hubConnection.state === HubConnectionState.Connecting ||
        hubConnection.state === HubConnectionState.Reconnecting)
    ) {
      return;
    }

    stopPolling();

    const token = getAuthToken();
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/notifications`, {
        accessTokenFactory: () => getAuthToken() || "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("ReceiveNotification", (notification: InAppNotificationResultDto) => {
      handleIncomingNotification(notification);
      void fetchNotifications();
    });

    connection.onreconnected(() => fetchNotifications());

    hubConnection = connection;
    startPollingPromise = connection
      .start()
      .then(() => fetchNotifications())
      .catch((error) => {
        console.warn("Failed to connect trainer notifications hub", error);
        if (hubConnection === connection) {
          hubConnection = null;
        }
      })
      .finally(() => {
        if (startPollingPromise) {
          startPollingPromise = null;
        }
      });

    await startPollingPromise;
  };

  watch(
    () => userId,
    () => {
      void fetchNotifications();
      void startPolling();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopPolling();
  });

  watch(
    () => getAuthToken(),
    (token) => {
      if (!token) {
        stopPolling();
        notifications.value = [];
        return;
      }

      if (hubConnection?.state === HubConnectionState.Connected) {
        return;
      }

      void startPolling();
    },
  );

  return {
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
  };
}
