import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import './styles/tailwind.css'
import App from './App.vue'
import { i18n } from './plugins/i18n'
import { router } from './router'
import { vuetify } from './plugins/vuetify'

const setupLocaleHeaderInterceptor = () => {
  if (typeof window === 'undefined')
    return

  const originalFetch = window.fetch.bind(window)

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined)

    if (init?.headers) {
      const initHeaders = new Headers(init.headers)
      initHeaders.forEach((value, key) => {
        headers.set(key, value)
      })
    }

    if (!headers.has('Accept-Language')) {
      const locale = i18n.global.locale.value === 'en' ? 'en' : 'pl'
      headers.set('Accept-Language', locale)
    }

    return originalFetch(input, {
      ...init,
      headers,
    })
  }
}

setupLocaleHeaderInterceptor()

createApp(App).use(vuetify).use(i18n).use(router).mount('#app')
