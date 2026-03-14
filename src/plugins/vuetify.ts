import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F5F5F5',
          surface: '#FFFFFF',
          primary: '#111111',
          secondary: '#6B6B6B',
          error: '#B3261E',
          info: '#0288D1',
          success: '#2E7D32',
          warning: '#ED6C02',
          outline: '#E0E0E0',
          'on-primary': '#FFFFFF',
          'on-surface': '#1A1A1A',
          'on-background': '#1A1A1A',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#0E1116',
          surface: '#171B22',
          primary: '#E8EAED',
          secondary: '#A3AAB8',
          error: '#F2B8B5',
          info: '#8CCFFF',
          success: '#8FD8A7',
          warning: '#F8C58C',
          outline: '#323947',
          'on-primary': '#111111',
          'on-surface': '#F3F4F6',
          'on-background': '#F3F4F6',
        },
      },
    },
  },
})
