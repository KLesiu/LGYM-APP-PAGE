<template>
  <div class="flex flex-col gap-5">
    <v-alert
      v-if="pageError"
      type="error"
      class="rounded-2xl"
      :text="pageError"
    />

    <v-alert
      v-if="pageSuccess"
      type="success"
      class="rounded-2xl"
      :text="pageSuccess"
    />

    <v-window v-model="activeSection" class="min-w-0" :touch="false">
      <v-window-item value="users">
        <section
          class="grid items-start gap-5 lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)]"
        >
          <AdminUserRegistrationForm @registered="handleUserRegistered" />

          <AdminUsersWorkspace
            :page="page"
            :total-pages="totalPages"
            :total-users="totalUsers"
            :users="users"
            :available-roles="availableRoles"
            :editable-roles="editableRoles"
            :is-loading="isLoadingUsers"
            :saving-role-user-ids="savingRoleUserIds"
            :format-date="formatDate"
            @change-page="changePage"
            @save-roles="saveRoles"
            @update-editable-roles="
              ({ userId, value }) => updateEditableRoles(userId, value)
            "
          />
        </section>
      </v-window-item>

      <v-window-item value="versions">
        <section class="grid gap-5">
          <AdminAppVersionPanel
            ref="appVersionPanelRef"
            @unauthorized="handleNestedUnauthorized"
          />
        </section>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  postApiAdminUsersPaginated,
  postApiRolesPaginated,
  postApiRolesUsersIdRoles,
} from "../../api/generated/demo";
import AdminAppVersionPanel from "../../components/admin/AdminAppVersionPanel.vue";
import AdminUserRegistrationForm from "../../components/admin/AdminUserRegistrationForm.vue";
import AdminUsersWorkspace from "../../components/admin/AdminUsersWorkspace.vue";
import type {
  AdminUserDto,
  PaginatedRoleRequest,
  PaginatedUserRequest,
  RoleDto,
  UpdateUserRolesRequest,
} from "../../api/model";
import { clearAuthSession } from "../../composables/useAuthSession";

type AdminAppVersionPanelRef = {
  refreshAll: () => Promise<void>;
};

const props = withDefaults(
  defineProps<{
    activeSection?: string;
  }>(),
  {
    activeSection: "users",
  },
);

const { t } = useI18n();
const router = useRouter();

const activeSection = toRef(props, "activeSection");

const page = ref(1);
const pageSize = 10;
const totalPages = ref(1);
const totalUsers = ref(0);
const users = ref<AdminUserDto[]>([]);
const roles = ref<RoleDto[]>([]);
const editableRoles = ref<Record<string, string[]>>({});
const isLoadingUsers = ref(false);
const isLoadingRoles = ref(false);
const pageError = ref("");
const pageSuccess = ref("");
const savingRoleUserIds = ref(new Set<string>());
const appVersionPanelRef = ref<AdminAppVersionPanelRef | null>(null);

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

  pageError.value = t("admin.feedback.unauthorized");
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

const handleNestedUnauthorized = async () => {
  pageError.value = t("admin.feedback.unauthorized");
  await redirectToAdminLogin();
};

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

const normalizeErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;

  return fallback;
};

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
      pageError.value = t("admin.feedback.rolesLoadFailed");
      return;
    }

    roles.value = response.data.items ?? [];
  } catch (error: unknown) {
    pageError.value = normalizeErrorMessage(
      error,
      t("admin.feedback.rolesLoadFailed"),
    );
  } finally {
    isLoadingRoles.value = false;
  }
};

const loadUsers = async (
  targetPage = page.value,
  options?: { preserveMessages?: boolean },
) => {
  isLoadingUsers.value = true;
  if (!options?.preserveMessages) {
    pageError.value = "";
    pageSuccess.value = "";
  }

  try {
    const request: PaginatedUserRequest = {
      page: targetPage,
      pageSize,
      includeDeleted: true,
    };

    const response = await postApiAdminUsersPaginated(request);

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status !== 200) {
      pageError.value = t("admin.feedback.usersLoadFailed");
      return;
    }

    users.value = response.data.items ?? [];
    totalUsers.value = response.data.totalCount ?? 0;
    totalPages.value = Math.max(response.data.totalPages ?? 1, 1);
    page.value = response.data.page ?? targetPage;
    syncEditableRoles(users.value);
  } catch (error: unknown) {
    pageError.value = normalizeErrorMessage(
      error,
      t("admin.feedback.usersLoadFailed"),
    );
  } finally {
    isLoadingUsers.value = false;
  }
};

const refreshData = async () => {
  const tasks: Promise<unknown>[] = [loadRoles(), loadUsers(page.value)];

  if (appVersionPanelRef.value) {
    tasks.push(appVersionPanelRef.value.refreshAll());
  }

  await Promise.all(tasks);
};

const handleUserRegistered = async () => {
  await loadUsers(1, { preserveMessages: true });
  pageSuccess.value = t("admin.register.feedback.userAddedToList");
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

  editableRoles.value[userId] = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const saveRoles = async (userId: string) => {
  savingRoleUserIds.value.add(userId);
  pageError.value = "";
  pageSuccess.value = "";

  try {
    const payload: UpdateUserRolesRequest = {
      roles: editableRoles.value[userId] ?? [],
    };

    const response = await postApiRolesUsersIdRoles(userId, payload);

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status !== 200) {
      pageError.value =
        response.data.msg ?? t("admin.feedback.rolesUpdateFailed");
      return;
    }

    users.value = users.value.map((user) =>
      user.id === userId
        ? { ...user, roles: [...(editableRoles.value[userId] ?? [])] }
        : user,
    );
    pageSuccess.value =
      response.data.msg ?? t("admin.feedback.rolesUpdateSuccess");
  } catch (error: unknown) {
    pageError.value = normalizeErrorMessage(
      error,
      t("admin.feedback.rolesUpdateFailed"),
    );
  } finally {
    savingRoleUserIds.value.delete(userId);
  }
};

defineExpose({
  refreshData,
  isRefreshing,
});

onMounted(async () => {
  await Promise.all([loadRoles(), loadUsers()]);
});
</script>
