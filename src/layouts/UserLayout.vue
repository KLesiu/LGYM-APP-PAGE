<template>
  <AppShell
    :active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('userArea.appName')"
    :brand-subtitle="t('userArea.appSubtitle')"
    :header-breadcrumbs="headerBreadcrumbs"
    :user="currentUser"
    @logout="logout"
  >
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
import { clearAuthSession } from "../composables/useAuthSession";
import { getCurrentUser } from "../composables/useCurrentUser";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const sectionByRouteName: Record<string, string> = {
  "user-account": "account",
};

const activeSection = computed(() => {
  const routeName = String(route.name ?? "");
  return sectionByRouteName[routeName] ?? "account";
});

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    key: "account",
    label: t("userArea.navigation.account"),
    icon: "mdi-account-circle-outline",
    to: "/athlete/account",
  },
]);

const sectionRouteByKey = {
  account: { name: "user-account" as const },
};

const headerBreadcrumbs = computed<AppBreadcrumbItem[]>(() => {
  const items: AppBreadcrumbItem[] = [
    {
      title: t("userArea.appName"),
      to: { name: "user-account" },
      exact: true,
    },
    {
      title: t(`userArea.layout.${activeSection.value}.title`),
      to: sectionRouteByKey[activeSection.value as keyof typeof sectionRouteByKey],
      exact: true,
    },
  ];

  items[items.length - 1] = { title: items[items.length - 1].title };

  return items;
});

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login" });
};
</script>
