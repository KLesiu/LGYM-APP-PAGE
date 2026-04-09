<template>
  <v-app>
    <div v-if="!hasLayout" class="pointer-events-none fixed right-4 top-4 z-50">
      <div class="pointer-events-auto flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>

    <v-main class="bg-background">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import { useAppLocale } from "../../composables/useAppLocale";
import { useAppTheme } from "../../composables/useAppTheme";
import LanguageToggle from "../ui/LanguageToggle.vue";
import ThemeToggle from "../ui/ThemeToggle.vue";

const route = useRoute();
const { initializeLocale } = useAppLocale();
const { initializeTheme } = useAppTheme();

const hasLayout = computed(() =>
  route.matched.some((record) => record.meta.hasLayout),
);

onMounted(() => {
  initializeLocale();
  initializeTheme();
});
</script>
