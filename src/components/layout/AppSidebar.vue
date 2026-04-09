<template>
  <div
    class="flex h-full flex-col gap-6 border-r border-[var(--lgym-border)] bg-[var(--lgym-surface)] p-5"
  >
    <!-- Branding Section -->
    <div class="flex items-center gap-3">
      <div
        class="inline-flex items-center justify-center rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] p-1.5"
      >
        <v-img :src="logoSrc" :alt="brandName" width="36" max-width="36" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-[var(--lgym-text)]">
          {{ brandName }}
        </p>
        <p v-if="brandSubtitle" class="text-xs text-[var(--lgym-text-muted)]">
          {{ brandSubtitle }}
        </p>
      </div>
    </div>

    <!-- Navigation Section -->
    <nav class="flex flex-col gap-1">
      <component
        :is="item.to ? 'router-link' : 'button'"
        v-for="item in items"
        :key="item.key"
        v-bind="item.to ? { to: item.to } : { type: 'button' }"
        class="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--lgym-text-muted)] transition-colors duration-150 hover:bg-[var(--lgym-overlay)] hover:text-[var(--lgym-text)]"
        :class="
          item.key === activeItem
            ? 'bg-[var(--lgym-overlay-strong)] text-[var(--lgym-text)] font-semibold'
            : ''
        "
        @click="handleItemClick(item)"
      >
        <!-- Active Indicator -->
        <div
          v-if="item.key === activeItem"
          class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--lgym-primary)]"
        />

        <v-icon :icon="item.icon" size="20" />
        <span>{{ item.label }}</span>
      </component>
    </nav>

    <!-- Footer Slot -->
    <div class="mt-auto">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
export type SidebarItem = {
  key: string;
  label: string;
  icon: string;
  to?: string;
};

defineProps<{
  items: SidebarItem[];
  activeItem: string;
  logoSrc: string;
  brandName: string;
  brandSubtitle?: string;
}>();

const emit = defineEmits<{
  "update:activeItem": [value: string];
}>();

function handleItemClick(item: SidebarItem) {
  emit("update:activeItem", item.key);
}
</script>
