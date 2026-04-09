<template>
  <article
    class="border border-[var(--lgym-border)] rounded-3xl bg-[var(--lgym-surface-muted)] p-5"
  >
    <div class="flex items-start gap-3">
      <div
        class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--lgym-note-icon-bg)] text-[var(--lgym-note-icon-text)]"
      >
        <v-icon icon="mdi-information-slab-circle-outline" size="22" />
      </div>
      <div>
        <p class="text-[var(--lgym-text)] text-sm font-semibold">
          {{ title }}
        </p>
        <p class="text-[var(--lgym-text-muted)] mt-2 text-sm leading-6">
          {{ description }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>
