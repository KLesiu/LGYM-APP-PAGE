<template>
  <AppShell
    :active-sidebar-item="activeSection"
    :sidebar-items="sidebarItems"
    :logo-src="logoLgym"
    :brand-name="t('trainerDashboard.appName')"
    :brand-subtitle="t('trainerDashboard.appSubtitle')"
    :header-breadcrumbs="headerBreadcrumbs"
    :header-title="headerTitle"
    :header-subtitle="headerSubtitle"
    :user="currentUser"
    @logout="logout"
  >
    <template v-if="isMemberDetailsRoute" #header-title>
      <div class="flex min-w-0 items-center gap-3 sm:gap-4">
        <v-avatar size="52" class="shrink-0">
          <v-img v-if="memberDetailsSnapshot?.avatar" :src="memberDetailsSnapshot.avatar" />
          <span v-else class="text-sm font-bold text-[var(--lgym-text)]">
            {{ memberInitials }}
          </span>
        </v-avatar>

        <div class="min-w-0">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <h1 class="truncate text-lg leading-6 font-semibold text-[var(--lgym-text)] sm:text-xl">
              {{ headerTitle }}
            </h1>

            <v-chip
              v-if="memberDetailsSnapshot?.status"
              :color="getMemberStatusColor(memberDetailsSnapshot.status)"
              size="small"
              variant="tonal"
            >
              {{ memberStatusLabel }}
            </v-chip>
          </div>

          <p v-if="memberDetailsEmail" class="mt-1 truncate text-sm leading-5 text-[var(--lgym-text-muted)]">
            {{ memberDetailsEmail }}
          </p>
        </div>
      </div>
    </template>

    <router-view v-slot="{ Component }">
      <div class="h-full min-h-0 min-w-0 w-full">
        <component :is="Component" />
      </div>
    </router-view>
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import logoLgym from "../assets/logoLGYM.png";
import type { AppBreadcrumbItem } from "../components/layout/appBreadcrumbs";
import AppShell from "../components/layout/AppShell.vue";
import type { SidebarItem } from "../components/layout/AppSidebar.vue";
import { clearAuthSession } from "../composables/useAuthSession";
import { getCurrentUser } from "../composables/useCurrentUser";
import {
  getInitials,
  getMemberStatusColor,
  getMemberStatusTranslationKey,
  getRememberedMemberSnapshot,
} from "../composables/useTrainerMembers";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const sectionByRouteName: Record<string, string> = {
  "trainer-members": "members",
  "trainer-member-details": "members",
  "trainer-member-plan-details": "members",
  "trainer-member-plan-day-create": "members",
  "trainer-member-plan-day-edit": "members",
  "trainer-invitations": "invitations",
  "trainer-training-plans": "trainingPlans",
  "trainer-training-plan-details": "trainingPlans",
  "trainer-training-plan-day-create": "trainingPlans",
  "trainer-training-plan-day-edit": "trainingPlans",
  "trainer-report-templates": "reportTemplates",
  "trainer-exercises": "exercises",
};

const activeSection = computed(() => {
  const routeName = String(route.name ?? "");
  return sectionByRouteName[routeName] ?? "members";
});

const isMemberDetailsRoute = computed(
  () =>
    [
      "trainer-member-details",
      "trainer-member-plan-details",
      "trainer-member-plan-day-create",
      "trainer-member-plan-day-edit",
    ].includes(String(route.name ?? "")),
);

const memberDetailsSnapshot = computed(() => {
  const traineeId = String(route.params.traineeId ?? "").trim();
  return traineeId ? getRememberedMemberSnapshot(traineeId) : null;
});

const memberDetailsTitle = computed(() => {
  const name = memberDetailsSnapshot.value?.name?.trim();
  if (name) return name;

  const email = memberDetailsSnapshot.value?.email?.trim();
  if (email) return email;

  return t("trainerMemberDetails.header.fallbackName");
});

const memberDetailsEmail = computed(
  () => memberDetailsSnapshot.value?.email?.trim() || "",
);

const memberInitials = computed(() =>
  getInitials(memberDetailsTitle.value || memberDetailsEmail.value),
);

const headerTitle = computed(() => {
  if (!isMemberDetailsRoute.value) {
    return t(`trainerArea.layout.${activeSection.value}.title`);
  }

  return memberDetailsTitle.value;
});

const headerSubtitle = computed(() => {
  if (!isMemberDetailsRoute.value) {
    return t(`trainerArea.layout.${activeSection.value}.subtitle`);
  }

  return "";
});

const sectionRouteByKey = {
  members: { name: "trainer-members" as const },
  invitations: { name: "trainer-invitations" as const },
  trainingPlans: { name: "trainer-training-plans" as const },
  exercises: { name: "trainer-exercises" as const },
  reportTemplates: { name: "trainer-report-templates" as const },
};

const headerBreadcrumbs = computed<AppBreadcrumbItem[]>(() => {
  const items: AppBreadcrumbItem[] = [
    {
      title: t("trainerDashboard.appName"),
      to: { name: "trainer-members" },
      exact: true,
    },
  ];
  const routeName = String(route.name ?? "");
  const sectionCrumb: AppBreadcrumbItem = {
    title: t(`trainerArea.layout.${activeSection.value}.title`),
    to: sectionRouteByKey[activeSection.value as keyof typeof sectionRouteByKey],
    exact: true,
  };

  if (isMemberDetailsRoute.value) {
    items.push(sectionCrumb);
    items.push(
      routeName === "trainer-member-details"
        ? { title: memberDetailsTitle.value }
        : {
            title: memberDetailsTitle.value,
            to: {
              name: "trainer-member-details",
              params: { traineeId: route.params.traineeId },
            },
            exact: true,
          },
    );

    if (routeName === "trainer-member-plan-details") {
      items.push({ title: t("ui.breadcrumbs.memberPlanDetails") });
    }

    if (routeName === "trainer-member-plan-day-create" || routeName === "trainer-member-plan-day-edit") {
      items.push({
        title: t("ui.breadcrumbs.memberPlanDetails"),
        to: {
          name: "trainer-member-plan-details",
          params: {
            traineeId: route.params.traineeId,
            planId: route.params.planId,
          },
        },
        exact: true,
      });
      items.push({
        title:
          routeName === "trainer-member-plan-day-create"
            ? t("ui.breadcrumbs.planDayCreate")
            : t("ui.breadcrumbs.planDayEdit"),
      });
    }

    return items;
  }

  items.push(sectionCrumb);

  if (routeName === "trainer-training-plan-details") {
    items.push({ title: t("ui.breadcrumbs.trainingPlanDetails") });
  }

  if (routeName === "trainer-training-plan-day-create" || routeName === "trainer-training-plan-day-edit") {
    items.push({
      title: t("ui.breadcrumbs.trainingPlanDetails"),
      to: {
        name: "trainer-training-plan-details",
        params: { planId: route.params.planId },
      },
      exact: true,
    });
    items.push({
      title:
        routeName === "trainer-training-plan-day-create"
          ? t("ui.breadcrumbs.planDayCreate")
          : t("ui.breadcrumbs.planDayEdit"),
    });
  }

  if (![
    "trainer-training-plan-details",
    "trainer-training-plan-day-create",
    "trainer-training-plan-day-edit",
  ].includes(routeName)) {
    items[items.length - 1] = { title: items[items.length - 1].title };
  }

  return items;
});

const memberStatusLabel = computed(() => {
  if (!memberDetailsSnapshot.value?.status) return "";
  return t(getMemberStatusTranslationKey(memberDetailsSnapshot.value.status));
});

const sidebarItems = computed<SidebarItem[]>(() => [
  {
    key: "members",
    label: t("trainerDashboard.navigation.members"),
    icon: "mdi-account-group-outline",
    to: "/trainer/members",
  },
  {
    key: "invitations",
    label: t("trainerDashboard.navigation.invitations"),
    icon: "mdi-email-fast-outline",
    to: "/trainer/invitations",
  },
  {
    key: "trainingPlans",
    label: t("trainerDashboard.navigation.trainingPlans"),
    icon: "mdi-clipboard-list-outline",
    to: "/trainer/training-plans",
  },
  {
    key: "exercises",
    label: t("trainerDashboard.navigation.exercises"),
    icon: "mdi-dumbbell",
    to: "/trainer/exercises",
  },
  {
    key: "reportTemplates",
    label: t("trainerDashboard.navigation.reportTemplates"),
    icon: "mdi-file-document-multiple-outline",
    to: "/trainer/report-templates",
  },
]);

const currentUser = computed(() => getCurrentUser());

const logout = async () => {
  clearAuthSession();
  await router.push({ name: "login" });
};
</script>
