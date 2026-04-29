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
          <slot name="breadcrumbs" />

          <h1
            v-if="title"
            class="m-0 text-lg leading-6 font-semibold text-[var(--lgym-text)] sm:text-xl"
          >
            {{ title }}
          </h1>

          <p
            v-if="subtitle"
            class="mt-1 max-w-3xl text-sm leading-5 text-[var(--lgym-text-muted)]"
          >
            {{ subtitle }}
          </p>
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

          <div class="flex items-center gap-2 sm:ml-2 sm:gap-3">
            <v-avatar v-if="user.avatar" size="34">
              <v-img :src="user.avatar" />
            </v-avatar>
            <v-avatar v-else size="34" color="primary" class="text-xs font-bold">
              {{ user.initials }}
            </v-avatar>

            <div class="hidden flex-col sm:flex">
              <span class="text-sm font-medium text-[var(--lgym-text)]">
                {{ user.name }}
              </span>
              <span class="text-xs text-[var(--lgym-text-muted)]">
                {{ displayUserMeta(user) }}
              </span>
            </div>

            <v-btn
              icon
              variant="text"
              size="small"
              color="secondary"
              @click="$emit('logout')"
            >
              <v-icon icon="mdi-logout" size="18" />
            </v-btn>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useI18n } from "vue-i18n";

import LanguageToggle from "../ui/LanguageToggle.vue";
import ThemeToggle from "../ui/ThemeToggle.vue";
import type { CurrentUser } from "../../composables/useCurrentUser";

defineProps<{
  title?: string;
  subtitle?: string;
  user: CurrentUser | null;
}>();

defineEmits<{
  logout: [];
  toggleSidebar: [];
}>();

const { t, te } = useI18n();
const slots = useSlots();
const hasActionsSlot = computed(() => !!slots.actions);

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
