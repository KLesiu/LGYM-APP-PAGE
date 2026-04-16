<template>
  <div class="flex h-full min-h-0 flex-col gap-4 lg:gap-5">
    <section class="grid h-full min-h-0 gap-4 lg:gap-5">
      <AdminUsersWorkspace
        ref="usersWorkspaceRef"
        :page="page"
        :page-size="pageSize"
        :total-pages="totalPages"
        :total-users="totalUsers"
        :users="users"
        :available-roles="availableRoles"
        :editable-roles="editableRoles"
        :is-loading="isLoadingUsers"
        :saving-role-user-ids="savingRoleUserIds"
        :recently-saved-role-user-id="recentlySavedRoleUserId"
        :format-date="formatDate"
        @change-page="changePage"
        @save-roles="saveRoles"
        @update-editable-roles="
          ({ userId, value }) => updateEditableRoles(userId, value)
        "
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import {
  postApiAdminUsersPaginated,
  postApiRolesPaginated,
  postApiRolesUsersIdRoles,
} from "../../api/generated/demo";
import AdminUsersWorkspace from "../../components/admin/AdminUsersWorkspace.vue";
import type {
  AdminUserDto,
  PaginatedRoleRequest,
  PaginatedUserRequest,
  RoleDto,
  UpdateUserRolesRequest,
} from "../../api/model";
import { clearAuthSession } from "../../composables/useAuthSession";
import { useToast } from "../../composables/useToast";

type AdminUsersWorkspaceRef = {
  getRecommendedPageSize: () => number;
};

const router = useRouter();
const toast = useToast();

const page = ref(1);
const pageSize = ref(4);
const totalPages = ref(1);
const totalUsers = ref(0);
const users = ref<AdminUserDto[]>([]);
const roles = ref<RoleDto[]>([]);
const editableRoles = ref<Record<string, string[]>>({});
const isLoadingUsers = ref(false);
const isLoadingRoles = ref(false);
const savingRoleUserIds = ref(new Set<string>());
const usersWorkspaceRef = ref<AdminUsersWorkspaceRef | null>(null);
const recentlySavedRoleUserId = ref<string | null>(null);
const usersRequestToken = ref(0);

let pageResizeFrame: number | null = null;
let savedRoleFeedbackTimeout: number | null = null;

const redirectToAdminLogin = async () => {
  clearAuthSession();
  await router.push({
    name: "login-admin",
    query: {
      redirect: "/admin/users",
    },
  });
};

const isUnauthorizedStatus = (status: number) =>
  status === 401 || status === 403;

const handleUnauthorizedResponse = async (status: number) => {
  if (!isUnauthorizedStatus(status)) return false;

  toast.error("admin.feedback.unauthorized");
  await redirectToAdminLogin();
  return true;
};

const availableRoles = computed(() =>
  roles.value
    .map((role) => ({
      value: role.name ?? "",
      label: role.name ?? "",
    }))
    .filter((role) => role.value.length > 0),
);

const isRefreshing = computed(
  () => isLoadingUsers.value || isLoadingRoles.value,
);

const syncEditableRoles = (items: AdminUserDto[]) => {
  editableRoles.value = items.reduce<Record<string, string[]>>(
    (accumulator, user) => {
      if (user.id) accumulator[user.id] = [...(user.roles ?? [])];

      return accumulator;
    },
    {},
  );
};

const normalizeRoles = (roles: string[] | null | undefined) =>
  [...(roles ?? [])].filter(Boolean).sort();

const hasPendingRoleChanges = () =>
  users.value.some((user) => {
    const userId = user.id ?? "";
    const current = normalizeRoles(user.roles);
    const edited = normalizeRoles(editableRoles.value[userId]);

    if (current.length !== edited.length) return true;

    return current.some((role, index) => role !== edited[index]);
  });

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const locale =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "pl-PL";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const loadRoles = async () => {
  isLoadingRoles.value = true;

  try {
    const request: PaginatedRoleRequest = {
      page: 1,
      pageSize: 100,
    };

    const response = await postApiRolesPaginated(request);

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status !== 200) {
      toast.error("admin.feedback.rolesLoadFailed");
      return;
    }

    roles.value = response.data.items ?? [];
  } catch (error: unknown) {
    console.error(error);
    toast.error("admin.feedback.rolesLoadFailed");
  } finally {
    isLoadingRoles.value = false;
  }
};

const loadUsers = async (targetPage = page.value) => {
  isLoadingUsers.value = true;

  try {
    const requestToken = ++usersRequestToken.value;
    const request: PaginatedUserRequest = {
      page: targetPage,
      pageSize: pageSize.value,
      includeDeleted: true,
    };

    const response = await postApiAdminUsersPaginated(request);

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status !== 200) {
      toast.error("admin.feedback.usersLoadFailed");
      return;
    }

    if (requestToken !== usersRequestToken.value) return;

    users.value = response.data.items ?? [];
    totalUsers.value = response.data.totalCount ?? 0;
    totalPages.value = Math.max(response.data.totalPages ?? 1, 1);
    page.value = response.data.page ?? targetPage;
    syncEditableRoles(users.value);
  } catch (error: unknown) {
    console.error(error);
    toast.error("admin.feedback.usersLoadFailed");
  } finally {
    isLoadingUsers.value = false;
  }
};

const refreshData = async () => {
  await Promise.all([loadRoles(), loadUsers(page.value)]);
};

const changePage = async (targetPage: number) => {
  if (targetPage < 1 || targetPage > totalPages.value) return;

  await loadUsers(targetPage);
};

const updateEditableRoles = (
  userId: string | null | undefined,
  value: unknown,
) => {
  if (!userId) return;

  if (recentlySavedRoleUserId.value === userId) {
    recentlySavedRoleUserId.value = null;
  }

  editableRoles.value[userId] = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const saveRoles = async (userId: string) => {
  savingRoleUserIds.value.add(userId);

  try {
    const payload: UpdateUserRolesRequest = {
      roles: editableRoles.value[userId] ?? [],
    };

    const response = await postApiRolesUsersIdRoles(userId, payload);

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status !== 200) {
      toast.error("admin.feedback.rolesUpdateFailed");
      return;
    }

    users.value = users.value.map((user) =>
      user.id === userId
        ? { ...user, roles: [...(editableRoles.value[userId] ?? [])] }
        : user,
    );
    recentlySavedRoleUserId.value = userId;
    if (savedRoleFeedbackTimeout !== null) {
      window.clearTimeout(savedRoleFeedbackTimeout);
    }
    savedRoleFeedbackTimeout = window.setTimeout(() => {
      if (recentlySavedRoleUserId.value === userId) {
        recentlySavedRoleUserId.value = null;
      }
      savedRoleFeedbackTimeout = null;
    }, 2200);
    toast.success("admin.feedback.rolesUpdateSuccess");
  } catch (error: unknown) {
    console.error(error);
    toast.error("admin.feedback.rolesUpdateFailed");
  } finally {
    savingRoleUserIds.value.delete(userId);
  }
};

const syncPageSizeWithViewport = async () => {
  if (hasPendingRoleChanges()) return;

  await nextTick();

  const recommendedSize = usersWorkspaceRef.value?.getRecommendedPageSize();
  if (!recommendedSize || recommendedSize === pageSize.value) return;

  pageSize.value = recommendedSize;
  const maxPage = Math.max(1, Math.ceil(totalUsers.value / pageSize.value));
  const targetPage = Math.min(page.value, maxPage);
  await loadUsers(targetPage);
};

const schedulePageSizeSync = () => {
  if (typeof window === "undefined") return;
  if (pageResizeFrame !== null) {
    window.cancelAnimationFrame(pageResizeFrame);
  }

  pageResizeFrame = window.requestAnimationFrame(() => {
    pageResizeFrame = null;
    void syncPageSizeWithViewport();
  });
};

defineExpose({
  refreshData,
  isRefreshing,
});

onMounted(async () => {
  await Promise.all([loadRoles(), loadUsers()]);
  await syncPageSizeWithViewport();

  if (typeof window !== "undefined") {
    window.addEventListener("resize", schedulePageSizeSync, {
      passive: true,
    });
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", schedulePageSizeSync);
    if (pageResizeFrame !== null) {
      window.cancelAnimationFrame(pageResizeFrame);
    }
    if (savedRoleFeedbackTimeout !== null) {
      window.clearTimeout(savedRoleFeedbackTimeout);
    }
  }
});
</script>
