<template>
  <v-app>
    <div class="pointer-events-none fixed right-4 top-4 z-50">
      <div class="pointer-events-auto">
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

import { useAppTheme } from '../../composables/useAppTheme'
import ThemeToggle from '../ui/ThemeToggle.vue'

const { initializeTheme } = useAppTheme()

onMounted(() => {
  initializeTheme()
})
</script>
