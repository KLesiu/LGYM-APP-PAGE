import type { RouteLocationRaw } from "vue-router";

export type AppBreadcrumbItem = {
  title: string;
  disabled?: boolean;
  to?: RouteLocationRaw;
  exact?: boolean;
};
