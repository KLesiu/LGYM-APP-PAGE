<template>
  <section class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
  <div class="px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t(`exerciseLibrary.roles.${roleMode}.eyebrow`) }}
          </p>
          <div>
            <h2 class="text-2xl font-semibold text-[var(--lgym-text)] sm:text-[2rem]">
              {{ t("exerciseLibrary.page.title") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t(`exerciseLibrary.roles.${roleMode}.subtitle`) }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-1.5 text-sm text-[var(--lgym-text-muted)]">
            {{ t("exerciseLibrary.page.summary", { totalCount }) }}
          </div>

          <v-btn
            v-if="canCreateExercises"
            color="primary"
            prepend-icon="mdi-plus"
            class="min-h-11 rounded-md px-4"
            @click="$emit('create')"
          >
            {{ t("exerciseLibrary.actions.add") }}
          </v-btn>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { RoleMode } from "./types";

defineProps<{
  roleMode: RoleMode;
  totalCount: number;
  canCreateExercises: boolean;
}>();

defineEmits<{
  create: [];
}>();

const { t } = useI18n();
</script>
