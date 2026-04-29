<template>
  <AppShell
    :active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('userArea.appName')"
    :brand-subtitle="t('userArea.appSubtitle')"
    :header-title="t(`userArea.layout.${activeSection}.title`)"
    :header-subtitle="t(`userArea.layout.${activeSection}.subtitle`)"
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
import AppShell from "../components/layout/AppShell.vue";
import type { SidebarItem } from "../components/layout/AppSidebar.vue";
import { clearAuthSession } from "../composables/useAuthSession";
import { getCurrentUser } from "../composables/useCurrentUser";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const sectionByRouteName: Record<string, string> = {
  "user-relationship-status": "relationship",
  "user-relationship-invitation": "relationship",
};

const activeSection = computed(() => {
  const routeName = String(route.name ?? "");
  return sectionByRouteName[routeName] ?? "relationship";
});

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    key: "relationship",
    label: t("userArea.navigation.relationship"),
    icon: "mdi-account-heart-outline",
    to: "/athlete/relationship",
  },
]);

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login" });
};
</script>
