import { createRouter, createWebHistory } from "vue-router";

import {
  hasAdminAccess,
  hasTrainerAccess,
} from "../composables/useAuthSession";
import AdminLayout from "../layouts/AdminLayout.vue";
import TrainerLayout from "../layouts/TrainerLayout.vue";
import AdminUsersPage from "../pages/admin/AdminUsersPage.vue";
import AdminVersionsPage from "../pages/admin/AdminVersionsPage.vue";
import TrainerInvitationsPage from "../pages/trainer/TrainerInvitationsPage.vue";
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
      component: AdminLayout,
      meta: {
        requiresAdmin: true,
        hasLayout: true,
      },
      children: [
        {
          path: "",
          redirect: "/admin/users",
        },
        {
          path: "users",
          name: "admin-users",
          component: AdminUsersPage,
        },
        {
          path: "versions",
          name: "admin-versions",
          component: AdminVersionsPage,
        },
      ],
    },
    {
      path: "/trainer",
      component: TrainerLayout,
      meta: {
        requiresTrainer: true,
        hasLayout: true,
      },
      children: [
        {
          path: "",
          redirect: "/trainer/invitations",
        },
        {
          path: "invitations",
          name: "trainer-invitations",
          component: TrainerInvitationsPage,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const requiresTrainer = to.matched.some(
    (record) => record.meta.requiresTrainer,
  );

  if (requiresAdmin && !hasAdminAccess()) {
    return {
      name: "login-admin",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (requiresTrainer && !hasTrainerAccess()) {
    return {
      name: "login",
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

  if (to.name === "login" && hasTrainerAccess()) {
    return {
      name: "trainer-invitations",
    };
  }

  return true;
});
