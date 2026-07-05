import { computed } from 'vue'
import { useTheme } from 'vuetify'

type AppThemeName = 'light' | 'dark'

const THEME_STORAGE_KEY = 'lgym-theme'

const isThemeName = (value: string | null): value is AppThemeName => {
  return value === 'light' || value === 'dark'
}

export const useAppTheme = () => {
  const theme = useTheme()

  const currentTheme = computed<AppThemeName>(() => {
    return theme.global.name.value === 'dark' ? 'dark' : 'light'
  })

  const isDark = computed(() => currentTheme.value === 'dark')

  const setTheme = (name: AppThemeName, persist = true) => {
    theme.global.name.value = name

    if (typeof window === 'undefined')
      return

    document.documentElement.style.colorScheme = name

    if (persist)
      window.localStorage.setItem(THEME_STORAGE_KEY, name)
  }

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  const initializeTheme = () => {
    if (typeof window === 'undefined')
      return

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

    if (isThemeName(savedTheme)) {
      setTheme(savedTheme, false)
      return
    }

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(systemPrefersDark ? 'dark' : 'light', false)
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    initializeTheme,
  }
}

export type { AppThemeName }
