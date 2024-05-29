import { createApp, nextTick } from 'vue'
import "./scss/main.scss"
import App from './App.vue'
import router from "./router.ts";
const apiURL = import.meta.env.VITE_API_URL

const startApp = ()=>{
    const app = createApp(App)
    app.use(router).mount('#app')
}
const checkToken = async(token:string)=>{
    const response = await fetch(`${apiURL}/api/checkToken`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} `,
        },
      }).then((res) => res.json());
      return response

}
nextTick(async()=>{
    const token = localStorage.getItem("token")
    if(!token) return router.push('/login')
    const isTokenValid = await checkToken(token)
    if(!isTokenValid.isValid) return router.push('/login')
    return router.push('/')

})
startApp()
