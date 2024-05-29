import {createRouter,createWebHistory} from 'vue-router'
import Contact from "./components/Contact.vue";
import Login from "./components/Login.vue";
import Home from "./components/Home.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/contact',
        name: 'Contact',
        component: Contact
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router