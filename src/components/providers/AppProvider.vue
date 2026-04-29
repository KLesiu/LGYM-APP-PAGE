<template>
  <v-app :class="{ 'app-layout-root': hasLayout }">
    <div v-if="!hasLayout" class="pointer-events-none fixed right-4 top-4 z-50">
      <div class="pointer-events-auto flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>

    <v-main :class="['bg-background', { 'app-layout-main': hasLayout }]">
      <slot />
    </v-main>

    <AppToastHost />
  </v-app>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

import { useAppLocale } from "../../composables/useAppLocale";
import { useAppTheme } from "../../composables/useAppTheme";
import AppToastHost from "../ui/AppToastHost.vue";
import LanguageToggle from "../ui/LanguageToggle.vue";
import ThemeToggle from "../ui/ThemeToggle.vue";

const route = useRoute();
const { initializeLocale } = useAppLocale();
const { initializeTheme } = useAppTheme();

const hasLayout = computed(() =>
  route.matched.some((record) => record.meta.hasLayout),
);

const syncLayoutViewportLock = (enabled: boolean) => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("app-layout-viewport", enabled);
  document.body.classList.toggle("app-layout-viewport", enabled);
};

watch(
  hasLayout,
  (value) => {
    syncLayoutViewportLock(value);
  },
  { immediate: true },
);

onMounted(() => {
  initializeLocale();
  initializeTheme();
});

onBeforeUnmount(() => {
  syncLayoutViewportLock(false);
});
</script>

<style>
.app-layout-root {
  height: 100vh;
  height: 100dvh;
}

.app-layout-main {
  height: 100%;
  overflow: hidden;
}

html.app-layout-viewport,
body.app-layout-viewport {
  height: 100%;
  overflow: hidden;
}
</style>
