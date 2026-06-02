import { createRouter, createWebHistory } from "vue-router";

import {
  hasAdminAccess,
  hasTrainerAccess,
  hasUserAccess,
} from "../composables/useAuthSession";
import AdminLayout from "../layouts/AdminLayout.vue";
import TrainerLayout from "../layouts/TrainerLayout.vue";
import UserLayout from "../layouts/UserLayout.vue";
import AdminExercisesPage from "../pages/admin/AdminExercisesPage.vue";
import AdminUsersPage from "../pages/admin/AdminUsersPage.vue";
import AdminVersionsPage from "../pages/admin/AdminVersionsPage.vue";
import TrainerExercisesPage from "../pages/trainer/TrainerExercisesPage.vue";
import TrainerMemberDetailsPage from "../pages/trainer/TrainerMemberDetailsPage.vue";
import TrainerMemberPlanDayEditorPage from "../pages/trainer/TrainerMemberPlanDayEditorPage.vue";
import TrainerMemberPlanDetailsPage from "../pages/trainer/TrainerMemberPlanDetailsPage.vue";
import TrainerInvitationsPage from "../pages/trainer/TrainerInvitationsPage.vue";
import TrainerMembersPage from "../pages/trainer/TrainerMembersPage.vue";
import TrainerSettingsPage from "../pages/trainer/TrainerSettingsPage.vue";
import TrainerTrainingPlanDayEditorPage from "../pages/trainer/TrainerTrainingPlanDayEditorPage.vue";
import TrainerTrainingPlanDetailsPage from "../pages/trainer/TrainerTrainingPlanDetailsPage.vue";
import TrainerTrainingPlansPage from "../pages/trainer/TrainerTrainingPlansPage.vue";
import TrainerReportTemplatesPage from "../pages/trainer/TrainerReportTemplatesPage.vue";
import LoginAdminPage from "../pages/LoginAdminPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import UserExercisesPage from "../pages/user/UserExercisesPage.vue";
import UserRelationshipPage from "../pages/user/UserRelationshipPage.vue";

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
        {
          path: "exercises",
          name: "admin-exercises",
          component: AdminExercisesPage,
        },
      ],
    },
    {
      path: "/athlete",
      component: UserLayout,
      meta: {
        requiresUser: true,
        hasLayout: true,
      },
      children: [
        {
          path: "",
          redirect: "/athlete/relationship",
        },
        {
          path: "relationship",
          name: "user-relationship-status",
          component: UserRelationshipPage,
        },
        {
          path: "exercises",
          name: "user-exercises",
          component: UserExercisesPage,
        },
        {
          path: "invitations/:invitationId",
          name: "user-relationship-invitation",
          component: UserRelationshipPage,
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
          redirect: "/trainer/members",
        },
        {
          path: "members",
          name: "trainer-members",
          component: TrainerMembersPage,
        },
        {
          path: "members/:traineeId",
          name: "trainer-member-details",
          component: TrainerMemberDetailsPage,
        },
        {
          path: "members/:traineeId/plans/:planId",
          name: "trainer-member-plan-details",
          component: TrainerMemberPlanDetailsPage,
        },
        {
          path: "members/:traineeId/plans/:planId/plan-days/new",
          name: "trainer-member-plan-day-create",
          component: TrainerMemberPlanDayEditorPage,
        },
        {
          path: "members/:traineeId/plans/:planId/plan-days/:planDayId",
          name: "trainer-member-plan-day-edit",
          component: TrainerMemberPlanDayEditorPage,
        },
        {
          path: "invitations",
          name: "trainer-invitations",
          component: TrainerInvitationsPage,
        },
        {
          path: "report-templates",
          name: "trainer-report-templates",
          component: TrainerReportTemplatesPage,
        },
        {
          path: "settings",
          name: "trainer-settings",
          component: TrainerSettingsPage,
        },
        {
          path: "exercises",
          name: "trainer-exercises",
          component: TrainerExercisesPage,
        },
        {
          path: "training-plans",
          name: "trainer-training-plans",
          component: TrainerTrainingPlansPage,
        },
        {
          path: "training-plans/:planId",
          name: "trainer-training-plan-details",
          component: TrainerTrainingPlanDetailsPage,
        },
        {
          path: "training-plans/:planId/plan-days/new",
          name: "trainer-training-plan-day-create",
          component: TrainerTrainingPlanDayEditorPage,
        },
        {
          path: "training-plans/:planId/plan-days/:planDayId",
          name: "trainer-training-plan-day-edit",
          component: TrainerTrainingPlanDayEditorPage,
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
  const requiresUser = to.matched.some((record) => record.meta.requiresUser);

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

  if (requiresUser && !hasUserAccess()) {
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
      path: "/trainer/members",
    };
  }

  if (to.name === "login" && hasUserAccess()) {
    return {
      path: "/athlete/relationship",
    };
  }

  return true;
});
