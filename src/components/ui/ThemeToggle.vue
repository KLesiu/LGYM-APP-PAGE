<template>
  <v-btn
    variant="text"
    size="small"
    icon
    color="secondary"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent'" />
  </v-btn>
</template>

<script setup lang="ts">
import { useAppTheme } from '../../composables/useAppTheme'

const { isDark, toggleTheme } = useAppTheme()
</script>
