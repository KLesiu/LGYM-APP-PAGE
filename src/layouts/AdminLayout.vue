<template>
  <AppShell
    :active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('admin.panel.brandTitle')"
    :brand-subtitle="t('admin.panel.eyebrow')"
    :header-title="t(`admin.tabs.items.${activeSection}.title`)"
    :header-subtitle="t(`admin.tabs.items.${activeSection}.description`)"
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
import AppShell from "../components/layout/AppShell.vue";
import type { SidebarItem } from "../components/layout/AppSidebar.vue";
import { clearAuthSession } from "../composables/useAuthSession";
import { getCurrentUser } from "../composables/useCurrentUser";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const sectionByRouteName: Record<string, string> = {
  "admin-users": "users",
  "admin-versions": "versions",
};

const activeSection = computed(() => {
  const routeName = String(route.name ?? "");
  const matchedSection = sectionByRouteName[routeName];

  if (matchedSection) {
    return matchedSection;
  }

  if (route.path.startsWith("/admin/versions")) {
    return "versions";
  }

  return "users";
});

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    key: "users",
    label: t("admin.tabs.items.users.label"),
    icon: "mdi-account-group-outline",
    to: { name: "admin-users" },
  },
  {
    key: "versions",
    label: t("admin.tabs.items.versions.label"),
    icon: "mdi-cellphone-arrow-down",
    to: { name: "admin-versions" },
  },
]);

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login-admin" });
};
</script>
