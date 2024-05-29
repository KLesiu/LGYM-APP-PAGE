import { createApp } from 'vue'
import "./scss/main.scss"
import App from './App.vue'
import router from "./router.ts";

const startApp = ()=>{
    const app = createApp(App)
    app.use(router).mount('#app')
}
startApp()
