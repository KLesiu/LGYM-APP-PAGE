<template>
  <AppShell
    :active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('admin.panel.brandTitle')"
    :brand-subtitle="t('admin.panel.eyebrow')"
    :header-breadcrumbs="headerBreadcrumbs"
    :user="currentUser"
    @logout="logout"
  >
    <template v-if="$slots['header-actions']" #header-actions>
      <slot name="header-actions" />
    </template>

    <router-view v-slot="{ Component }">
      <div class="h-full min-h-0 min-w-0 w-full">
        <component :is="Component" />
      </div>
    </router-view>
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import logoLgym from "../assets/logoLGYM.png";
import type { AppBreadcrumbItem } from "../components/layout/appBreadcrumbs";
import AppShell from "../components/layout/AppShell.vue";
import type { SidebarItem } from "../components/layout/AppSidebar.vue";
import {
  clearAuthSession,
  hasAdminAccess,
  hasGlobalExerciseManagementAccess,
} from "../composables/useAuthSession";
import { getCurrentUser } from "../composables/useCurrentUser";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const sectionByRouteName: Record<string, string> = {
  "admin-users": "users",
  "admin-versions": "versions",
  "admin-exercises": "exercises",
};

const canAccessAdminUsers = computed(() => hasAdminAccess());
const canAccessAdminVersions = computed(() => hasAdminAccess());
const canAccessAdminExercises = computed(
  () => hasAdminAccess() || hasGlobalExerciseManagementAccess(),
);

const activeSection = computed(() => {
  const routeName = String(route.name ?? "");
  const matchedSection = sectionByRouteName[routeName];

  if (matchedSection) {
    return matchedSection;
  }

  if (route.path.startsWith("/admin/versions")) {
    return "versions";
  }

  if (route.path.startsWith("/admin/exercises")) {
    return "exercises";
  }

  return "users";
});

const sidebarItems = computed<SidebarItem[]>(() => {
  const items: SidebarItem[] = [];

  if (canAccessAdminUsers.value) {
    items.push({
      key: "users",
      label: t("admin.tabs.items.users.label"),
      icon: "mdi-account-group-outline",
      to: { name: "admin-users" },
    });
  }

  if (canAccessAdminVersions.value) {
    items.push({
      key: "versions",
      label: t("admin.tabs.items.versions.label"),
      icon: "mdi-cellphone-arrow-down",
      to: { name: "admin-versions" },
    });
  }

  if (canAccessAdminExercises.value) {
    items.push({
      key: "exercises",
      label: t("admin.tabs.items.exercises.label"),
      icon: "mdi-dumbbell",
      to: { name: "admin-exercises" },
    });
  }

  return items;
});

const adminHomeSection = computed(() => {
  if (canAccessAdminUsers.value) return "users";
  if (canAccessAdminVersions.value) return "versions";
  return "exercises";
});

const sectionRouteByKey = {
  users: { name: "admin-users" as const },
  versions: { name: "admin-versions" as const },
  exercises: { name: "admin-exercises" as const },
};

const headerBreadcrumbs = computed<AppBreadcrumbItem[]>(() => {
  const breadcrumbs: AppBreadcrumbItem[] = [
    {
      title: t("admin.panel.brandTitle"),
      to: sectionRouteByKey[adminHomeSection.value as keyof typeof sectionRouteByKey],
      exact: true,
    },
  ];

  if (activeSection.value !== adminHomeSection.value) {
    breadcrumbs.push({
      title: t(`admin.tabs.items.${activeSection.value}.title`),
      to: sectionRouteByKey[activeSection.value as keyof typeof sectionRouteByKey],
    });
  }

  return breadcrumbs;
});

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login-admin" });
};
</script>
