import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import './styles/tailwind.css'
import App from './App.vue'
import { i18n } from './plugins/i18n'
import { router } from './router'
import { vuetify } from './plugins/vuetify'

createApp(App).use(vuetify).use(i18n).use(router).mount('#app')
