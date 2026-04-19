<template>
  <header
    class="flex min-h-[72px] items-center justify-between border-b border-[var(--lgym-border)] bg-[var(--lgym-shell-surface)] px-4 sm:px-5 lg:px-6"
  >
    <!-- Left side -->
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger -->
      <div class="mr-2 lg:hidden">
        <v-btn icon variant="text" size="small" @click="$emit('toggleSidebar')">
          <v-icon icon="mdi-menu" />
        </v-btn>
      </div>

      <!-- Title section -->
      <div class="flex flex-col">
        <slot name="breadcrumbs" />

        <h1
          v-if="title"
          class="m-0 text-lg font-semibold text-[var(--lgym-text)] sm:text-xl"
        >
          {{ title }}
        </h1>

        <p v-if="subtitle" class="m-0 text-sm text-[var(--lgym-text-muted)]">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-2">
      <!-- Page-specific actions slot -->
      <slot name="actions" />

      <!-- Separator after actions (only if actions exist) -->
      <div
        v-if="hasActionsSlot"
        class="mx-1 h-6 w-px bg-[var(--lgym-border)]"
      />

      <!-- Theme toggle -->
      <ThemeToggle />

      <!-- Language toggle -->
      <LanguageToggle />

      <!-- User area (only if user exists) -->
      <template v-if="user">
        <!-- Separator before user -->
        <div class="ml-1 h-6 w-px bg-[var(--lgym-border)]" />

        <div class="ml-2 flex items-center gap-3">
          <!-- Avatar -->
          <v-avatar v-if="user.avatar" size="34">
            <v-img :src="user.avatar" />
          </v-avatar>
          <v-avatar v-else size="34" color="primary" class="text-xs font-bold">
            {{ user.initials }}
          </v-avatar>

          <!-- User info (hidden on small screens) -->
          <div class="hidden flex-col sm:flex">
            <span class="text-sm font-medium text-[var(--lgym-text)]">
              {{ user.name }}
            </span>
            <span class="text-xs text-[var(--lgym-text-muted)]">
              {{ displayUserMeta(user) }}
            </span>
          </div>

          <!-- Logout button -->
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
