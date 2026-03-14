<template>
  <v-app>
    <div class="pointer-events-none fixed right-4 top-4 z-50">
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
import { onMounted } from 'vue'

import { useAppLocale } from '../../composables/useAppLocale'
import { useAppTheme } from '../../composables/useAppTheme'
import LanguageToggle from '../ui/LanguageToggle.vue'
import ThemeToggle from '../ui/ThemeToggle.vue'

const { initializeLocale } = useAppLocale()
const { initializeTheme } = useAppTheme()

onMounted(() => {
  initializeLocale()
  initializeTheme()
})
</script>
