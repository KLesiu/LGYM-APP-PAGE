import { createRouter, createWebHistory } from "vue-router";

import { hasAdminAccess } from "../composables/useAuthSession";
import AdminUsersPage from "../pages/admin/AdminUsersPage.vue";
import LoginAdminPage from "../pages/LoginAdminPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/login-admin",
      name: "login-admin",
      component: LoginAdminPage,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterPage,
    },
    {
      path: "/admin",
      redirect: "/admin/users",
      meta: {
        requiresAdmin: true,
      },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: AdminUsersPage,
      meta: {
        requiresAdmin: true,
      },
    },
  ],
});

router.beforeEach((to) => {
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  if (requiresAdmin && !hasAdminAccess()) {
    return {
      name: "login-admin",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.name === "login-admin" && hasAdminAccess()) {
    return {
      name: "admin-users",
    };
  }

  return true;
});
