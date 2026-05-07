import { computed } from 'vue'

import { i18n } from '../plugins/i18n'

export type AppLocale = 'pl' | 'en'

export type AppLocaleOption = {
  value: AppLocale
  code: 'PL' | 'EN'
  labelKey: 'ui.language.polish' | 'ui.language.english'
  flag: string
}

export const appLocaleOptions: AppLocaleOption[] = [
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

const LOCALE_STORAGE_KEY = 'lgym-locale'

const isLocale = (value: string | null): value is AppLocale => {
  return value === 'pl' || value === 'en'
}

const detectSystemLocale = (): AppLocale => {
  if (typeof window === 'undefined')
    return 'pl'

  const browserLocale = window.navigator.language.toLowerCase()
  return browserLocale.startsWith('pl') ? 'pl' : 'en'
}

export const useAppLocale = () => {
  const currentLocale = computed<AppLocale>(() => {
    return i18n.global.locale.value === 'en' ? 'en' : 'pl'
  })

  const setLocale = (locale: AppLocale, persist = true) => {
    i18n.global.locale.value = locale

    if (!persist || typeof window === 'undefined')
      return

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }

  const initializeLocale = () => {
    if (typeof window === 'undefined')
      return

    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)

    if (isLocale(savedLocale)) {
      setLocale(savedLocale, false)
      return
    }

    setLocale(detectSystemLocale(), false)
  }

  return {
    currentLocale,
    setLocale,
    initializeLocale,
  }
}
