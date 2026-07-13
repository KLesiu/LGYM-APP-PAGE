import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { Router } from "vue-router";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { getApiTrainerTrainees, postApiTrainerTraineesTraineeIdUnlink } from "../api/generated/demo";
import {
  GetApiTrainerTraineesDefaultOperator,
  GetApiTrainerTraineesGroupLogic,
  TrainerDashboardTraineeDtoStatus,
  type GetApiTrainerTraineesParams,
  type TrainerDashboardTraineeDto,
  type TrainerDashboardTraineesResponse,
} from "../api/model";
import { getApiErrorMessage } from "../api/trainerInvitations";
import { clearAuthSession } from "./useAuthSession";
import { useToast } from "./useToast";

export type MemberStatusFilter = "All" | TrainerDashboardTraineeDtoStatus;
export type MembersSortField =
  | "name"
  | "status"
  | "createdAt";
export type MembersSortDirection = "asc" | "desc";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const MEMBER_SNAPSHOT_STORAGE_KEY = "trainer-member-snapshots";
const ALLOWED_SORT_FIELDS: MembersSortField[] = ["name", "createdAt", "status"];

const readStoredMemberSnapshots = (): Record<string, TrainerDashboardTraineeDto> => {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = window.sessionStorage.getItem(MEMBER_SNAPSHOT_STORAGE_KEY);
    if (!rawValue) return {};

    const parsed = JSON.parse(rawValue) as Record<string, TrainerDashboardTraineeDto>;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
};

const memberSnapshots = ref<Record<string, TrainerDashboardTraineeDto>>(
  readStoredMemberSnapshots(),
);

const persistMemberSnapshots = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      MEMBER_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(memberSnapshots.value),
    );
  } catch {
    // Ignore persistence failures.
  }
};

export const rememberMemberSnapshots = (items: TrainerDashboardTraineeDto[]) => {
  const nextValue = { ...memberSnapshots.value };

  for (const item of items) {
    const traineeId = item._id?.trim();
    if (!traineeId) continue;

    nextValue[traineeId] = item;
  }

  memberSnapshots.value = nextValue;
  persistMemberSnapshots();
};

export const rememberMemberSnapshot = (item: TrainerDashboardTraineeDto) => {
  rememberMemberSnapshots([item]);
};

export const getRememberedMemberSnapshot = (traineeId: string) =>
  memberSnapshots.value[traineeId] ?? null;

export const canUnlinkMember = (member: TrainerDashboardTraineeDto) => {
  const traineeId = member._id?.trim();
  return Boolean(traineeId && member.isLinked);
};

export const canOpenMemberDetails = (member: TrainerDashboardTraineeDto) => {
  const traineeId = member._id?.trim();
  return Boolean(traineeId && member.isLinked);
};

export const getMemberStatusTranslationKey = (
  status: TrainerDashboardTraineeDtoStatus | null | undefined,
) => {
  switch (status) {
    case TrainerDashboardTraineeDtoStatus.Linked:
      return "trainerMembers.status.linked";
    case TrainerDashboardTraineeDtoStatus.InvitationPending:
      return "trainerMembers.status.invitationPending";
    case TrainerDashboardTraineeDtoStatus.InvitationExpired:
      return "trainerMembers.status.invitationExpired";
    case TrainerDashboardTraineeDtoStatus.InvitationRejected:
      return "trainerMembers.status.invitationRejected";
    case TrainerDashboardTraineeDtoStatus.InvitationAccepted:
      return "trainerMembers.status.invitationAccepted";
    case TrainerDashboardTraineeDtoStatus.NoRelationship:
      return "trainerMembers.status.noRelationship";
    default:
      return "trainerMembers.status.unknown";
  }
};

export const getMemberStatusColor = (
  status: TrainerDashboardTraineeDtoStatus | null | undefined,
) => {
  switch (status) {
    case TrainerDashboardTraineeDtoStatus.Linked:
      return "success";
    case TrainerDashboardTraineeDtoStatus.InvitationPending:
      return "warning";
    case TrainerDashboardTraineeDtoStatus.InvitationAccepted:
      return "info";
    case TrainerDashboardTraineeDtoStatus.InvitationExpired:
    case TrainerDashboardTraineeDtoStatus.InvitationRejected:
      return "error";
    default:
      return "secondary";
  }
};

export const formatTrainerDateTime = (
  locale: string,
  value: string | null | undefined,
) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const userLocale = locale === "pl" ? "pl-PL" : "en-US";

  return new Intl.DateTimeFormat(userLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

export const formatTrainerDate = (
  locale: string,
  value: string | null | undefined,
) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const userLocale = locale === "pl" ? "pl-PL" : "en-US";

  return new Intl.DateTimeFormat(userLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export const getInitials = (value: string | null | undefined) => {
  const cleaned = (value ?? "").trim();
  if (!cleaned) return "LG";

  const initials = cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || cleaned.slice(0, 2).toUpperCase();
};

export const handleTrainerUnauthorizedResponse = async (
  status: number,
  router: Router,
  toast: ReturnType<typeof useToast>,
  redirectPath: string,
) => {
  if (status !== 401 && status !== 403) return false;

  clearAuthSession();
  toast.error("trainerMembers.feedback.unauthorized");
  await router.push({
    name: "login",
    query: {
      redirect: redirectPath,
    },
  });
  return true;
};

export const useTrainerMembers = () => {
  const { locale } = useI18n();
  const router = useRouter();
  const toast = useToast();

  const members = ref<TrainerDashboardTraineeDto[]>([]);
  const isLoadingList = ref(false);
  const hasLoadError = ref(false);
  const unlinkingMemberIds = ref(new Set<string>());

  const page = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const totalCount = ref(0);
  const searchQuery = ref("");
  const debouncedSearchQuery = ref("");
  const statusFilter = ref<MemberStatusFilter>("All");
  const sortBy = ref<MembersSortField>("name");
  const sortDirection = ref<MembersSortDirection>("asc");

  const totalPages = computed(() =>
    Math.max(Math.ceil(totalCount.value / pageSize.value) || 1, 1),
  );
  const hasNextPage = computed(() => page.value < totalPages.value);
  const hasPreviousPage = computed(() => page.value > 1);

  let searchTimeout: number | null = null;
  let requestToken = 0;

  const clearSearchTimeout = () => {
    if (typeof window === "undefined" || searchTimeout === null) return;

    window.clearTimeout(searchTimeout);
    searchTimeout = null;
  };

  const buildParams = (): GetApiTrainerTraineesParams => ({
    Search: debouncedSearchQuery.value || undefined,
    Status: statusFilter.value === "All" ? undefined : statusFilter.value,
    DefaultOperator: GetApiTrainerTraineesDefaultOperator.Contains,
    GroupLogic: GetApiTrainerTraineesGroupLogic.Or,
    SortBy: ALLOWED_SORT_FIELDS.includes(sortBy.value) ? sortBy.value : "name",
    SortDirection: sortDirection.value,
    Page: page.value,
    PageSize: pageSize.value,
  });

  const loadMembers = async () => {
    const currentToken = ++requestToken;
    isLoadingList.value = true;
    hasLoadError.value = false;

    try {
      const response = await getApiTrainerTrainees(buildParams());

      if (currentToken !== requestToken) return;

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          "/trainer/members",
        )
      ) {
        return;
      }

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) {
          toast.errorMessage(message);
        } else {
          toast.error("trainerMembers.feedback.loadFailed");
        }
        hasLoadError.value = true;
        return;
      }

      const data = response.data as TrainerDashboardTraineesResponse;
      members.value = data.items ?? [];
      totalCount.value = data.total ?? 0;
      page.value = data.page ?? page.value;
      pageSize.value = data.pageSize ?? pageSize.value;
      rememberMemberSnapshots(members.value);
    } catch (error) {
      if (currentToken !== requestToken) return;

      console.error(error);
      toast.error("trainerMembers.feedback.loadFailed");
      hasLoadError.value = true;
    } finally {
      if (currentToken === requestToken) {
        isLoadingList.value = false;
      }
    }
  };

  const refreshMembers = async () => {
    await loadMembers();
  };

  const unlinkMember = async (member: TrainerDashboardTraineeDto) => {
    const traineeId = member._id?.trim();
    if (!traineeId || !canUnlinkMember(member)) return false;

    unlinkingMemberIds.value.add(traineeId);

    try {
      const response = await postApiTrainerTraineesTraineeIdUnlink(traineeId);

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          `/trainer/members/${traineeId}`,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) {
          toast.errorMessage(message);
        } else {
          toast.error("trainerMembers.feedback.unlinkFailed");
        }
        return false;
      }

      toast.success("trainerMembers.feedback.unlinkSuccess");
      await refreshMembers();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerMembers.feedback.unlinkFailed");
      return false;
    } finally {
      unlinkingMemberIds.value.delete(traineeId);
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

  watch([statusFilter, pageSize, sortBy, sortDirection], () => {
    page.value = 1;
  });

  watch(
    [debouncedSearchQuery, statusFilter, sortBy, sortDirection, page, pageSize],
    () => {
      void loadMembers();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearSearchTimeout();
  });

  return {
    locale,
    members,
    isLoadingList,
    hasLoadError,
    unlinkingMemberIds,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    searchQuery,
    statusFilter,
    sortBy,
    sortDirection,
    formatDateTime: (value: string | null | undefined) =>
      formatTrainerDateTime(locale.value, value),
    formatDate: (value: string | null | undefined) =>
      formatTrainerDate(locale.value, value),
    refreshMembers,
    unlinkMember,
  };
};
