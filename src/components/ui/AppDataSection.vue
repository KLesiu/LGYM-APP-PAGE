<template>
  <section class="flex min-h-0 min-w-0 w-full flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
  <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl lgym-section-heading">
            <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
              {{ eyebrow }}
            </p>

            <h2 class="text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="lgym-section-heading__subtitle text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ subtitle }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 self-start lg:self-auto lg:justify-end">
            <div
              v-if="summaryText"
              class="rounded-full border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-2 text-sm text-[var(--lgym-text-muted)]"
            >
              {{ summaryText }}
            </div>

            <slot name="header-actions" />
          </div>
        </div>

        <div v-if="$slots.controls" class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_repeat(3,auto)] xl:items-center">
          <slot name="controls" />
        </div>

        <div v-if="$slots.filters" class="flex flex-wrap gap-2">
          <slot name="filters" />
        </div>
      </div>
    </div>

    <div class="min-h-0 flex-1">
      <slot />
    </div>

    <div v-if="showPagination" class="border-t border-[var(--lgym-border)] px-4 pb-5 pt-7 sm:px-5 sm:pb-5 sm:pt-7">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ paginationSummary }}
        </p>

        <div class="flex w-full flex-col gap-3 self-end sm:w-auto sm:flex-row">
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="disablePrevious"
            @click="$emit('previous')"
          >
            {{ previousLabel }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="disableNext"
            @click="$emit('next')"
          >
            {{ nextLabel }}
          </v-btn>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    summaryText?: string;
    paginationSummary?: string;
    previousLabel?: string;
    nextLabel?: string;
    disablePrevious?: boolean;
    disableNext?: boolean;
    showPagination?: boolean;
  }>(),
  {
    eyebrow: "",
    subtitle: "",
    summaryText: "",
    paginationSummary: "",
    previousLabel: "Previous",
    nextLabel: "Next",
    disablePrevious: false,
    disableNext: false,
    showPagination: true,
  },
);

defineEmits<{
  previous: [];
  next: [];
}>();
</script>
