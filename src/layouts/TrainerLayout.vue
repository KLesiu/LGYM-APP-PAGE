<template>
  <AppShell
    :active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('trainerDashboard.appName')"
    :brand-subtitle="t('trainerDashboard.appSubtitle')"
    :header-title="t(`trainerArea.layout.${activeSection}.title`)"
    :header-subtitle="t(`trainerArea.layout.${activeSection}.subtitle`)"
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
  "trainer-members": "members",
  "trainer-member-details": "members",
  "trainer-invitations": "invitations",
  "trainer-report-templates": "reportTemplates",
};

const activeSection = computed(() => {
  const routeName = String(route.name ?? "");
  return sectionByRouteName[routeName] ?? "members";
});

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    key: "members",
    label: t("trainerDashboard.navigation.members"),
    icon: "mdi-account-group-outline",
    to: "/trainer/members",
  },
  {
    key: "invitations",
    label: t("trainerDashboard.navigation.invitations"),
    icon: "mdi-email-fast-outline",
    to: "/trainer/invitations",
  },
  {
    key: "reportTemplates",
    label: t("trainerDashboard.navigation.reportTemplates"),
    icon: "mdi-file-document-multiple-outline",
    to: "/trainer/report-templates",
  },
]);

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login" });
};
</script>
