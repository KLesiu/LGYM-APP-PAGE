import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  getApiErrorMessage,
  postTrainerInvitationRevoke,
  postTrainerInvitationsByEmail,
  postTrainerInvitationsPaginated,
} from "../api/trainerInvitations";
import {
  FilterConditionOperator,
  FilterGroupOperator,
  type CreateTrainerInvitationByEmailRequest,
  type FilterCondition,
  type FilterGroup,
  type PaginatedTrainerInvitationRequest,
  type PaginatedTrainerInvitationResult,
  type TrainerInvitationDto,
} from "../api/model";
import { clearAuthSession } from "./useAuthSession";
import { useAppLocale } from "./useAppLocale";
import { useToast } from "./useToast";

export type InvitationStatusFilter =
  | "All"
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Revoked"
  | "Expired";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const detectTimeZone = () => {
  const fallback = "Europe/Warsaw";

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
};

const buildFilterGroups = (
  debouncedSearch: string,
  statusFilter: InvitationStatusFilter,
): FilterGroup[] | undefined => {
  const conditions: FilterCondition[] = [];

  if (statusFilter !== "All") {
    conditions.push({
      fieldName: "status",
      operator: FilterConditionOperator.Equals,
      value: statusFilter,
    });
  }

  const groups: FilterGroup[] = [];
  if (debouncedSearch) {
    groups.push({
      operator: FilterGroupOperator.Or,
      conditions: [
        {
          fieldName: "inviteeEmail",
          operator: FilterConditionOperator.Contains,
          value: debouncedSearch,
        },
      ],
      groups: [],
    });
  }

  if (conditions.length === 0 && groups.length === 0) {
    return undefined;
  }

  return [
    {
      operator: FilterGroupOperator.And,
      conditions,
      groups,
    },
  ];
};

export const normalizeInvitationStatus = (status: string | null | undefined) =>
  (status ?? "").trim().toLowerCase();

export const canRevokeInvitation = (invitation: TrainerInvitationDto) =>
  normalizeInvitationStatus(invitation.status) === "pending" &&
  typeof invitation._id === "string" &&
  invitation._id.trim().length > 0;

export const useTrainerInvitations = () => {
  const { locale } = useI18n();
  const router = useRouter();
  const { currentLocale } = useAppLocale();
  const toast = useToast();

  const invitations = ref<TrainerInvitationDto[]>([]);
  const isLoadingList = ref(false);
  const isCreatingInvitation = ref(false);
  const revokingInvitationIds = ref(new Set<string>());

  const page = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const totalCount = ref(0);
  const totalPages = ref(1);
  const hasNextPage = ref(false);
  const hasPreviousPage = ref(false);
  const searchQuery = ref("");
  const debouncedSearchQuery = ref("");
  const statusFilter = ref<InvitationStatusFilter>("All");
  const sortDescending = ref(true);

  const defaultLanguage = computed(() => currentLocale.value);
  const defaultTimeZone = computed(() => detectTimeZone());

  let searchTimeout: number | null = null;
  let requestToken = 0;

  const clearSearchTimeout = () => {
    if (typeof window === "undefined" || searchTimeout === null) return;

    window.clearTimeout(searchTimeout);
    searchTimeout = null;
  };

  const handleUnauthorizedResponse = async (status: number) => {
    if (status !== 401 && status !== 403) return false;

    clearAuthSession();
    toast.error("trainerInvitations.feedback.unauthorized");
    await router.push({
      name: "login",
      query: {
        redirect: "/trainer/invitations",
      },
    });
    return true;
  };

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    const userLocale = locale.value === "pl" ? "pl-PL" : "en-US";

    return new Intl.DateTimeFormat(userLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  };

  const buildRequest = (): PaginatedTrainerInvitationRequest => ({
    page: page.value,
    pageSize: pageSize.value,
    filterGroups: buildFilterGroups(
      debouncedSearchQuery.value,
      statusFilter.value,
    ),
    sortDescriptors: [
      {
        fieldName: "createdAt",
        descending: sortDescending.value,
      },
    ],
  });

  const loadInvitations = async () => {
    const currentToken = ++requestToken;
    isLoadingList.value = true;

    try {
      const response = await postTrainerInvitationsPaginated(buildRequest());

      if (currentToken !== requestToken) return;

      if (await handleUnauthorizedResponse(response.status)) {
        return;
      }

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) {
          toast.errorMessage(message);
        } else {
          toast.error("trainerInvitations.feedback.loadFailed");
        }
        return;
      }

      const data = response.data as PaginatedTrainerInvitationResult;

      invitations.value = data.items ?? [];
      totalCount.value = data.totalCount ?? 0;
      totalPages.value = Math.max(data.totalPages ?? 1, 1);
      page.value = data.page ?? page.value;
      pageSize.value = data.pageSize ?? pageSize.value;
      hasNextPage.value = data.hasNextPage ?? false;
      hasPreviousPage.value = data.hasPreviousPage ?? false;
    } catch (error) {
      if (currentToken !== requestToken) return;

      console.error(error);
      toast.error("trainerInvitations.feedback.loadFailed");
    } finally {
      if (currentToken === requestToken) {
        isLoadingList.value = false;
      }
    }
  };

  const refreshInvitations = async () => {
    await loadInvitations();
  };

  const createInvitation = async (
    payload: CreateTrainerInvitationByEmailRequest,
  ) => {
    isCreatingInvitation.value = true;

    try {
      const response = await postTrainerInvitationsByEmail(payload);

      if (await handleUnauthorizedResponse(response.status)) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) {
          toast.errorMessage(message);
        } else {
          toast.error("trainerInvitations.feedback.createFailed");
        }

        return false;
      }

      toast.success("trainerInvitations.feedback.createSuccess");
      page.value = 1;
      await refreshInvitations();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerInvitations.feedback.createFailed");
      return false;
    } finally {
      isCreatingInvitation.value = false;
    }
  };

  const revokeInvitation = async (invitation: TrainerInvitationDto) => {
    const invitationId = invitation._id?.trim();
    if (!invitationId) return false;

    revokingInvitationIds.value.add(invitationId);

    try {
      const response = await postTrainerInvitationRevoke(invitationId);

      if (await handleUnauthorizedResponse(response.status)) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) {
          toast.errorMessage(message);
        } else {
          toast.error("trainerInvitations.feedback.revokeFailed");
        }
        return false;
      }

      toast.success("trainerInvitations.feedback.revokeSuccess");
      await refreshInvitations();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerInvitations.feedback.revokeFailed");
      return false;
    } finally {
      revokingInvitationIds.value.delete(invitationId);
    }
  };

  watch(searchQuery, (value) => {
    clearSearchTimeout();

    if (typeof window === "undefined") {
      page.value = 1;
      debouncedSearchQuery.value = value.trim();
      return;
    }

    searchTimeout = window.setTimeout(() => {
      page.value = 1;
      debouncedSearchQuery.value = value.trim();
      searchTimeout = null;
    }, SEARCH_DEBOUNCE_MS);
  });

  watch(statusFilter, () => {
    page.value = 1;
  });

  watch(pageSize, () => {
    page.value = 1;
  });

  watch(
    [debouncedSearchQuery, statusFilter, page, pageSize, sortDescending],
    () => {
      void loadInvitations();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearSearchTimeout();
  });

  return {
    invitations,
    isLoadingList,
    isCreatingInvitation,
    revokingInvitationIds,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    searchQuery,
    statusFilter,
    sortDescending,
    defaultLanguage,
    defaultTimeZone,
    formatDateTime,
    refreshInvitations,
    createInvitation,
    revokeInvitation,
  };
};
