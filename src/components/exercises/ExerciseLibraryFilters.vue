<template>
  <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 lg:px-6">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
      <v-text-field
        :model-value="searchQuery"
        :label="t('exerciseLibrary.filters.search')"
        :placeholder="t('exerciseLibrary.filters.searchPlaceholder')"
        density="compact"
        variant="outlined"
        hide-details
        prepend-inner-icon="mdi-magnify"
        class="min-w-[220px] flex-1"
        @update:model-value="$emit('update:searchQuery', String($event ?? ''))"
      />

      <v-select
        :model-value="bodyPartFilter"
        :label="t('exerciseLibrary.filters.bodyPart')"
        :items="bodyPartOptions"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="min-w-[210px]"
        @update:model-value="$emit('update:bodyPartFilter', String($event ?? 'all'))"
      />
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <v-btn
        v-for="option in sourceOptions"
        :key="option.value"
        :variant="sourceFilter === option.value ? 'flat' : 'outlined'"
        color="primary"
        size="small"
        class="rounded-md px-3"
        @click="$emit('update:sourceFilter', option.value)"
      >
        {{ t(option.labelKey) }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { SelectOption, SourceFilter } from "./types";

defineProps<{
  searchQuery: string;
  bodyPartFilter: string;
  bodyPartOptions: SelectOption[];
  sourceFilter: SourceFilter;
}>();

defineEmits<{
  "update:searchQuery": [value: string];
  "update:bodyPartFilter": [value: string];
  "update:sourceFilter": [value: SourceFilter];
}>();

const { t } = useI18n();

const sourceOptions = [
  { value: "all", labelKey: "exerciseLibrary.filters.all" },
  { value: "global", labelKey: "exerciseLibrary.filters.global" },
  { value: "user", labelKey: "exerciseLibrary.filters.user" },
] as const;
</script>
