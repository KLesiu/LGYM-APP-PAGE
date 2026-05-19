<template>
  <aside
    class="flex h-full min-h-0 w-[288px] min-w-[288px] max-w-[288px] flex-col overflow-hidden border-r border-[var(--lgym-border)] bg-[var(--lgym-shell-surface)] px-5 py-6"
  >
    <!-- Branding Section -->
    <div class="flex items-center gap-3">
      <div
        class="inline-flex items-center justify-center rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] p-1.5"
      >
        <v-img :src="logoSrc" :alt="brandName" width="36" max-width="36" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-[var(--lgym-text)]">
          {{ brandName }}
        </p>
        <p
          v-if="brandSubtitle"
          class="truncate text-xs text-[var(--lgym-text-muted)]"
        >
          {{ brandSubtitle }}
        </p>
      </div>
    </div>

    <!-- Navigation -->
    <v-list
      nav
      density="comfortable"
      bg-color="transparent"
      class="mt-6 flex min-h-0 flex-1 flex-col gap-0 overflow-x-hidden overflow-y-auto p-0"
    >
      <v-list-item
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        :active="item.key === activeItem"
        rounded="0"
        class="relative min-h-12 px-4 py-3 text-sm font-medium text-[var(--lgym-text-muted)] transition-all duration-150 hover:bg-[var(--lgym-overlay)] hover:text-[var(--lgym-text)]"
        :class="
          item.key === activeItem
            ? 'bg-[var(--lgym-nav-active-bg)] font-semibold text-[var(--lgym-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
            : ''
        "
        @click="handleItemClick(item)"
      >
        <template #prepend>
          <div
            v-if="item.key === activeItem"
            class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--lgym-primary)]"
          />
          <v-icon
            :icon="item.icon"
            size="20"
            class="mr-3 shrink-0 self-start text-current opacity-100"
          />
        </template>

        <v-list-item-title
          class="whitespace-normal break-words text-sm leading-5 font-inherit text-current"
        >
          {{ item.label }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Footer -->
    <div class="mt-6 shrink-0">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

export type SidebarItem = {
  key: string;
  label: string;
  icon: string;
  to: RouteLocationRaw;
};

defineProps<{
  items: SidebarItem[];
  activeItem: string;
  logoSrc: string;
  brandName: string;
  brandSubtitle?: string;
}>();

const emit = defineEmits<{
  "item-click": [value: string];
}>();

function handleItemClick(item: SidebarItem) {
  emit("item-click", item.key);
}
</script>
