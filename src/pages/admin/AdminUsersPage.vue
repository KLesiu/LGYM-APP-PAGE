<template>
  <v-container
    fluid
    class="admin-dashboard min-h-screen px-4 py-6 sm:px-6 lg:px-8"
  >
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section
        class="hero-shell overflow-hidden rounded-[32px] border border-white/10"
      >
        <div
          class="hero-grid grid gap-6 px-5 py-5 sm:px-7 sm:py-7 xl:grid-cols-[minmax(0,1.35fr)_360px]"
        >
          <div class="flex flex-col gap-6">
            <div class="flex flex-wrap items-center gap-3 text-white/90">
              <div
                class="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-3 py-2 backdrop-blur-sm"
              >
                <div
                  class="rounded-2xl bg-white px-2 py-1 shadow-lg shadow-black/20"
                >
                  <v-img
                    :src="logoLgym"
                    alt="LGYM logo"
                    width="54"
                    max-width="54"
                  />
                </div>
                <div>
                  <p
                    class="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65"
                  >
                    {{ t("admin.panel.eyebrow") }}
                  </p>
                  <p class="text-sm font-medium text-white">
                    LGYM Control Room
                  </p>
                </div>
              </div>

              <div
                class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-100"
              >
                <span class="h-2 w-2 rounded-full bg-emerald-300" />
                Secure workspace
              </div>
            </div>

            <div class="max-w-3xl space-y-4">
              <h1
                class="text-4xl font-semibold leading-tight text-white sm:text-5xl"
              >
                {{ t("admin.panel.title") }}
              </h1>
              <p class="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                {{ t("admin.panel.subtitle") }}
              </p>
            </div>

            <div class="flex flex-wrap gap-3 text-sm text-white/80">
              <div
                class="rounded-full border border-white/12 bg-white/6 px-4 py-2 backdrop-blur-sm"
              >
                Users · Roles · Access
              </div>
              <div
                class="rounded-full border border-white/12 bg-white/6 px-4 py-2 backdrop-blur-sm"
              >
                LGYM administration suite
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <article class="metric-card">
                <div class="metric-icon bg-sky-400/18 text-sky-100">
                  <v-icon icon="mdi-account-group-outline" size="20" />
                </div>
                <div class="space-y-1">
                  <p class="text-xs uppercase tracking-[0.22em] text-white/45">
                    {{ t("admin.stats.totalUsers") }}
                  </p>
                  <p class="text-3xl font-semibold text-white">
                    {{ totalUsers }}
                  </p>
                </div>
              </article>

              <article class="metric-card">
                <div class="metric-icon bg-amber-400/18 text-amber-100">
                  <v-icon icon="mdi-shield-alert-outline" size="20" />
                </div>
                <div class="space-y-1">
                  <p class="text-xs uppercase tracking-[0.22em] text-white/45">
                    {{ t("admin.stats.blockedUsers") }}
                  </p>
                  <p class="text-3xl font-semibold text-white">
                    {{ blockedUsers }}
                  </p>
                </div>
              </article>

              <article class="metric-card">
                <div class="metric-icon bg-emerald-400/18 text-emerald-100">
                  <v-icon icon="mdi-shield-crown-outline" size="20" />
                </div>
                <div class="space-y-1">
                  <p class="text-xs uppercase tracking-[0.22em] text-white/45">
                    {{ t("admin.stats.availableRoles") }}
                  </p>
                  <p class="text-3xl font-semibold text-white">
                    {{ availableRoles.length }}
                  </p>
                </div>
              </article>
            </div>
          </div>

          <aside
            class="hero-side flex flex-col justify-between gap-6 rounded-[28px] border border-white/10 bg-black/18 p-5 backdrop-blur-xl"
          >
            <div class="space-y-4">
              <div
                class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20"
              >
                <v-icon icon="mdi-dumbbell" size="26" />
              </div>

              <div>
                <p class="text-xs uppercase tracking-[0.22em] text-white/45">
                  LGYM Admin Suite
                </p>
                <p class="mt-2 text-lg font-semibold text-white">
                  Keep users, permissions, and workspace access under one sharp
                  control surface.
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <v-btn
                variant="outlined"
                color="white"
                prepend-icon="mdi-refresh"
                :loading="isRefreshing"
                class="hero-action-btn"
                @click="refreshData"
              >
                {{ t("admin.actions.refresh") }}
              </v-btn>

              <v-btn
                variant="flat"
                color="primary"
                prepend-icon="mdi-logout"
                class="hero-action-btn"
                @click="logout"
              >
                {{ t("admin.actions.logout") }}
              </v-btn>
            </div>
          </aside>
        </div>
      </section>

      <v-alert
        v-if="pageError"
        type="error"
        variant="tonal"
        border="start"
        class="rounded-2xl"
        :text="pageError"
      />

      <v-alert
        v-if="pageSuccess"
        type="success"
        variant="tonal"
        border="start"
        class="rounded-2xl"
        :text="pageSuccess"
      />

      <section
        class="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start"
      >
        <AdminUserRegistrationForm @registered="handleUserRegistered" />

        <v-card
          rounded="[32px]"
          class="user-workspace overflow-hidden border border-[rgb(var(--v-theme-outline))] bg-surface/95"
        >
          <div
            class="border-b border-[rgb(var(--v-theme-outline))] px-5 py-5 sm:px-6"
          >
            <div
              class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
            >
              <div class="space-y-2">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--v-theme-primary))]"
                >
                  LGYM User Registry
                </p>
                <div>
                  <h2
                    class="text-2xl font-semibold text-[rgb(var(--v-theme-on-surface))]"
                  >
                    {{ t("admin.table.user") }} &amp;
                    {{ t("admin.table.roles") }}
                  </h2>
                  <p
                    class="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--v-theme-secondary))]"
                  >
                    Review account status, inspect assigned roles, and make
                    access changes without leaving the dashboard.
                  </p>
                </div>
              </div>

              <div
                class="flex flex-wrap gap-3 text-sm text-[rgb(var(--v-theme-secondary))]"
              >
                <div
                  class="rounded-full border border-[rgb(var(--v-theme-outline))] bg-[rgb(var(--v-theme-surface-variant))] px-4 py-2"
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

          <v-progress-linear
            v-if="isLoadingUsers"
            indeterminate
            color="primary"
          />

          <v-card-text class="pa-0">
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead
                  class="border-b border-[rgb(var(--v-theme-outline))] bg-[rgb(var(--v-theme-surface-variant))]/70"
                >
                  <tr>
                    <th
                      class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--v-theme-secondary))]"
                    >
                      {{ t("admin.table.user") }}
                    </th>
                    <th
                      class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--v-theme-secondary))]"
                    >
                      {{ t("admin.table.email") }}
                    </th>
                    <th
                      class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--v-theme-secondary))]"
                    >
                      {{ t("admin.table.status") }}
                    </th>
                    <th
                      class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--v-theme-secondary))]"
                    >
                      {{ t("admin.table.roles") }}
                    </th>
                    <th
                      class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--v-theme-secondary))]"
                    >
                      {{ t("admin.table.actions") }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="!isLoadingUsers && users.length === 0">
                    <td
                      colspan="5"
                      class="px-5 py-12 text-center text-sm text-[rgb(var(--v-theme-secondary))]"
                    >
                      {{ t("admin.table.empty") }}
                    </td>
                  </tr>

                  <tr
                    v-for="(user, index) in users"
                    :key="user.id ?? user.email ?? user.name ?? `user-${index}`"
                    class="border-b border-[rgb(var(--v-theme-outline))] transition-colors duration-200 hover:bg-[rgb(var(--v-theme-surface-variant))]/35"
                  >
                    <td class="px-5 py-5 align-top">
                      <div class="flex items-start gap-4">
                        <div class="user-avatar">
                          {{ getUserInitial(user) }}
                        </div>

                        <div class="min-w-0 space-y-2">
                          <div>
                            <p
                              class="truncate text-sm font-semibold text-[rgb(var(--v-theme-on-surface))]"
                            >
                              {{ user.name || t("admin.table.unknownName") }}
                            </p>
                            <p
                              class="mt-1 text-xs text-[rgb(var(--v-theme-secondary))]"
                            >
                              ID: {{ user.id || "—" }}
                            </p>
                          </div>

                          <div
                            class="flex flex-wrap gap-2"
                            v-if="(user.roles?.length ?? 0) > 0"
                          >
                            <v-chip
                              v-for="role in user.roles ?? []"
                              :key="`${user.id}-${role}`"
                              size="x-small"
                              variant="tonal"
                              color="primary"
                              class="font-medium"
                            >
                              {{ role }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      class="px-5 py-5 align-top text-sm text-[rgb(var(--v-theme-on-surface))]"
                    >
                      <div class="space-y-1">
                        <p>{{ user.email || "—" }}</p>
                        <p class="text-xs text-[rgb(var(--v-theme-secondary))]">
                          {{ formatDate(user.createdAt) }}
                        </p>
                      </div>
                    </td>

                    <td class="px-5 py-5 align-top">
                      <div class="flex flex-wrap gap-2">
                        <v-chip
                          size="small"
                          :color="user.isBlocked ? 'warning' : 'success'"
                          variant="tonal"
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
                          variant="tonal"
                        >
                          {{ t("admin.status.deleted") }}
                        </v-chip>
                      </div>
                    </td>

                    <td class="min-w-[280px] px-5 py-5 align-top">
                      <v-select
                        :model-value="editableRoles[user.id ?? ''] ?? []"
                        :items="availableRoles"
                        item-title="label"
                        item-value="value"
                        multiple
                        chips
                        closable-chips
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        rounded="xl"
                        class="role-select"
                        :menu-props="{ maxHeight: 300 }"
                        :disabled="
                          !user.id ||
                          isSavingRoles(user.id) ||
                          availableRoles.length === 0
                        "
                        @update:model-value="
                          (value) => updateEditableRoles(user.id, value)
                        "
                      />
                    </td>

                    <td class="px-5 py-5 align-top">
                      <v-btn
                        variant="flat"
                        color="primary"
                        rounded="xl"
                        class="min-w-[132px]"
                        :loading="
                          user.id ? savingRoleUserIds.has(user.id) : false
                        "
                        :disabled="!user.id || savingRoleUserIds.has(user.id)"
                        @click="user.id && saveRoles(user.id)"
                      >
                        {{ t("admin.actions.saveRoles") }}
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>

          <div
            class="border-t border-[rgb(var(--v-theme-outline))] px-5 py-4 sm:px-6"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="text-sm text-[rgb(var(--v-theme-secondary))]">
                {{
                  t("admin.pagination.summary", {
                    page,
                    totalPages,
                    totalCount: totalUsers,
                  })
                }}
              </p>

              <div class="flex gap-3">
                <v-btn
                  variant="outlined"
                  color="primary"
                  rounded="xl"
                  :disabled="page <= 1 || isLoadingUsers"
                  @click="changePage(page - 1)"
                >
                  {{ t("admin.actions.previous") }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  rounded="xl"
                  :disabled="page >= totalPages || isLoadingUsers"
                  @click="changePage(page + 1)"
                >
                  {{ t("admin.actions.next") }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </section>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  postApiAdminUsersPaginated,
  postApiRolesPaginated,
  postApiRolesUsersIdRoles,
} from "../../api/generated/demo";
import AdminUserRegistrationForm from "../../components/admin/AdminUserRegistrationForm.vue";
import type {
  AdminUserDto,
  PaginatedRoleRequest,
  PaginatedUserRequest,
  RoleDto,
  UpdateUserRolesRequest,
} from "../../api/model";
import logoLgym from "../../assets/logoLGYM.png";
import { clearAuthSession } from "../../composables/useAuthSession";

const { t } = useI18n();
const router = useRouter();

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
      label: role.description?.trim()
        ? `${role.name} — ${role.description}`
        : (role.name ?? ""),
    }))
    .filter((role) => role.value.length > 0),
);

const blockedUsers = computed(
  () => users.value.filter((user) => user.isBlocked).length,
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

const getUserInitial = (user: AdminUserDto) => {
  const source = user.name?.trim() || user.email?.trim() || "L";
  return source.charAt(0).toUpperCase();
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
  await Promise.all([loadRoles(), loadUsers(page.value)]);
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

const isSavingRoles = (userId: string | null | undefined) =>
  !!userId && savingRoleUserIds.value.has(userId);

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

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login-admin" });
};

onMounted(async () => {
  await Promise.all([loadRoles(), loadUsers()]);
});
</script>

<style scoped>
.admin-dashboard {
  background:
    radial-gradient(
      circle at top left,
      rgba(102, 126, 234, 0.14),
      transparent 32%
    ),
    radial-gradient(
      circle at top right,
      rgba(16, 185, 129, 0.1),
      transparent 28%
    ),
    rgb(var(--v-theme-background));
}

.hero-shell {
  position: relative;
  background:
    linear-gradient(
      135deg,
      rgba(7, 10, 20, 0.96),
      rgba(18, 24, 39, 0.88) 44%,
      rgba(30, 41, 59, 0.92)
    ),
    #050816;
  box-shadow: 0 24px 80px rgba(2, 6, 23, 0.34);
}

.hero-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 20% 18%,
      rgba(56, 189, 248, 0.22),
      transparent 26%
    ),
    radial-gradient(circle at 80% 0%, rgba(99, 102, 241, 0.22), transparent 30%);
  pointer-events: none;
}

.hero-grid,
.hero-side,
.metric-card {
  position: relative;
  z-index: 1;
}

.metric-card {
  display: flex;
  min-height: 132px;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 26px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.04)
  );
  padding: 1.2rem;
  backdrop-filter: blur(18px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.metric-icon {
  display: inline-flex;
  height: 48px;
  width: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-action-btn {
  min-height: 46px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

.user-workspace {
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.user-avatar {
  display: inline-flex;
  height: 52px;
  width: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.24),
    rgba(129, 140, 248, 0.28)
  );
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.role-select :deep(.v-field) {
  border-radius: 18px;
}
</style>
