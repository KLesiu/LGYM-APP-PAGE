<template>
  <v-menu location="bottom end" offset="8">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        color="secondary"
        class="rounded-md! px-2!"
        :aria-label="t('ui.language.current', { code: activeLanguage.code })"
        :title="t('ui.language.current', { code: activeLanguage.code })"
      >
        <span class="text-base">{{ activeLanguage.flag }}</span>
        <span class="text-xs font-semibold tracking-wide">{{ activeLanguage.code }}</span>
      </v-btn>
    </template>

    <v-list density="compact" min-width="120">
      <v-list-item
        v-for="option in languageOptions"
        :key="option.value"
        :active="currentLocale === option.value"
        @click="setLocale(option.value)"
      >
        <template #prepend>
          <span class="text-base">{{ option.flag }}</span>
        </template>

        <v-list-item-title>{{ t(option.labelKey) }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AppLocale } from '../../composables/useAppLocale'
import { useAppLocale } from '../../composables/useAppLocale'

type LanguageOption = {
  value: AppLocale
  code: 'PL' | 'EN'
  labelKey: 'ui.language.polish' | 'ui.language.english'
  flag: string
}

const languageOptions: LanguageOption[] = [
  {
    value: 'pl',
    code: 'PL',
    labelKey: 'ui.language.polish',
    flag: '🇵🇱',
  },
  {
    value: 'en',
    code: 'EN',
    labelKey: 'ui.language.english',
    flag: '🇬🇧',
  },
]

const { t } = useI18n()
const { currentLocale, setLocale } = useAppLocale()

const activeLanguage = computed(() => {
  const selected = languageOptions.find(option => option.value === currentLocale.value)
  return selected ?? languageOptions[0]
})
</script>
