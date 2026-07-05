<template>
  <v-btn
    variant="text"
    size="small"
    icon
    color="secondary"
    :aria-label="isDark ? t('ui.theme.switchToLight') : t('ui.theme.switchToDark')"
    :title="isDark ? t('ui.theme.switchToLight') : t('ui.theme.switchToDark')"
    @click="toggleTheme"
  >
    <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent'" />
  </v-btn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useAppTheme } from '../../composables/useAppTheme'

const { t } = useI18n()
const { isDark, toggleTheme } = useAppTheme()
</script>
