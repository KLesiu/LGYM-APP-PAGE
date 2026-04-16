<template>
  <AppShell
    v-model:active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('admin.panel.brandTitle')"
    :brand-subtitle="t('admin.panel.eyebrow')"
    :header-title="t(`admin.tabs.items.${activeSection}.title`)"
    :header-subtitle="t(`admin.tabs.items.${activeSection}.description`)"
    :user="currentUser"
    @logout="logout"
  >
    <template #header-actions>
      <slot name="header-actions" />
    </template>

    <router-view v-slot="{ Component }">
      <div class="h-full min-h-0 w-full">
        <component :is="Component" :active-section="activeSection" />
      </div>
    </router-view>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import logoLgym from "../assets/logoLGYM.png";
import AppShell from "../components/layout/AppShell.vue";
import type { SidebarItem } from "../components/layout/AppSidebar.vue";
import { clearAuthSession } from "../composables/useAuthSession";
import { getCurrentUser } from "../composables/useCurrentUser";

const { t } = useI18n();
const router = useRouter();

const activeSection = ref("users");

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    key: "users",
    label: t("admin.tabs.items.users.label"),
    icon: "mdi-account-group-outline",
  },
  {
    key: "versions",
    label: t("admin.tabs.items.versions.label"),
    icon: "mdi-cellphone-arrow-down",
  },
]);

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login-admin" });
};
</script>
