import { createI18n } from 'vue-i18n'
import { en as vuetifyEn, pl as vuetifyPl } from 'vuetify/locale'

import en from '../locales/en.json'
import pl from '../locales/pl.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: {
    en: {
      ...en,
      $vuetify: vuetifyEn,
    },
    pl: {
      ...pl,
      $vuetify: vuetifyPl,
    },
  },
})
