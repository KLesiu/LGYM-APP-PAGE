<template>
  <header
    class="border-b border-[var(--lgym-border)] bg-[var(--lgym-shell-surface)] px-4 py-3 sm:px-5 lg:px-6"
  >
    <div class="flex min-h-[72px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center">
        <div class="lg:hidden">
          <v-btn icon variant="text" size="small" @click="$emit('toggleSidebar')">
            <v-icon icon="mdi-menu" />
          </v-btn>
        </div>

        <div class="min-w-0 flex-1">
          <v-breadcrumbs
            v-if="hasBreadcrumbs"
            :items="breadcrumbs"
            density="compact"
            class="mb-1 min-w-0 px-0 py-0"
          >
            <template #divider>
              <v-icon
                icon="mdi-chevron-right"
                size="14"
                class="text-[var(--lgym-text-muted)]"
              />
            </template>

            <template #title="{ item }">
              <span class="truncate text-xs text-[var(--lgym-text-muted)] sm:text-sm">
                {{ item.title }}
              </span>
            </template>
          </v-breadcrumbs>
          <slot v-else name="breadcrumbs" />

          <slot name="title">
            <h1
              v-if="title"
              class="m-0 text-lg leading-6 font-semibold text-[var(--lgym-text)] sm:text-xl"
            >
              {{ title }}
            </h1>
          </slot>

          <slot name="subtitle">
            <p
              v-if="subtitle"
              class="mt-1 max-w-3xl text-sm leading-5 text-[var(--lgym-text-muted)]"
            >
              {{ subtitle }}
            </p>
          </slot>
        </div>
      </div>

      <div class="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
        <slot name="actions" />

        <div
          v-if="hasActionsSlot"
          class="hidden sm:block sm:mx-1 sm:h-6 sm:w-px sm:bg-[var(--lgym-border)]"
        />

        <ThemeToggle />
        <LanguageToggle />

        <template v-if="user">
          <div class="hidden sm:block sm:ml-1 sm:h-6 sm:w-px sm:bg-[var(--lgym-border)]" />

          <v-menu location="bottom end" offset="10">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                color="secondary"
                class="app-header-user-menu rounded-md! px-2! py-1! sm:ml-2"
                :aria-label="t('ui.header.accountMenu')"
                :title="t('ui.header.accountMenu')"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <v-avatar v-if="user.avatar" size="34">
                    <v-img :src="user.avatar" />
                  </v-avatar>
                  <v-avatar v-else size="34" color="primary" class="text-xs font-bold">
                    {{ user.initials }}
                  </v-avatar>

                  <div class="hidden min-w-0 flex-col text-left sm:flex">
                    <span class="truncate text-sm font-medium text-[var(--lgym-text)]">
                      {{ user.name }}
                    </span>
                    <span class="truncate text-xs text-[var(--lgym-text-muted)]">
                      {{ displayUserMeta(user) }}
                    </span>
                  </div>

                  <v-icon
                    icon="mdi-chevron-down"
                    size="18"
                    class="hidden text-[var(--lgym-text-muted)] sm:block"
                  />
                </div>
              </v-btn>
            </template>

            <v-list min-width="240" density="comfortable" class="py-1">
              <v-list-item>
                <template #prepend>
                  <v-avatar v-if="user.avatar" size="34">
                    <v-img :src="user.avatar" />
                  </v-avatar>
                  <v-avatar v-else size="34" color="primary" class="text-xs font-bold">
                    {{ user.initials }}
                  </v-avatar>
                </template>

                <v-list-item-title class="text-sm font-semibold text-[var(--lgym-text)]">
                  {{ user.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="mt-0.5 text-[var(--lgym-text-muted)]">
                  {{ displayUserMeta(user) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider class="my-1" />

              <v-list-item @click="$emit('logout')">
                <template #prepend>
                  <v-icon icon="mdi-logout" size="18" />
                </template>
                <v-list-item-title>{{ t('ui.header.logout') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, toRefs, useSlots } from "vue";
import { useI18n } from "vue-i18n";

import type { AppBreadcrumbItem } from "./appBreadcrumbs";
import LanguageToggle from "../ui/LanguageToggle.vue";
import ThemeToggle from "../ui/ThemeToggle.vue";
import type { CurrentUser } from "../../composables/useCurrentUser";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  user: CurrentUser | null;
  breadcrumbs?: AppBreadcrumbItem[];
}>();

defineEmits<{
  logout: [];
  toggleSidebar: [];
}>();

const { t, te } = useI18n();
const slots = useSlots();
const { breadcrumbs, subtitle, title, user } = toRefs(props);
const hasActionsSlot = computed(() => !!slots.actions);
const hasBreadcrumbs = computed(() => (breadcrumbs.value?.length ?? 0) > 0);

const translateRole = (role: string) => {
  const normalizedRole = role.trim().toLowerCase();
  if (!normalizedRole) return "";

  const translationKey = `auth.roles.${normalizedRole}`;
  return te(translationKey) ? t(translationKey) : role;
};

const displayUserMeta = (user: CurrentUser) => {
  const translatedRole = translateRole(user.role);
  return translatedRole || user.email;
};
</script>

<style scoped>
.app-header-user-menu {
  min-width: 0;
  max-width: min(100%, 280px);
}
</style>
