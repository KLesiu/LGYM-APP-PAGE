<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-6 py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
          {{ t("exerciseLibrary.translationDialog.eyebrow") }}
        </p>
        <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
          {{ t("exerciseLibrary.translationDialog.title") }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("exerciseLibrary.translationDialog.subtitle", { name: exerciseName }) }}
        </p>
      </div>

      <v-card-text class="px-6 py-6">
        <div class="grid gap-5">
          <v-select
            :model-value="culture"
            :label="t('exerciseLibrary.translationDialog.fields.culture')"
            :items="localeOptions"
            item-title="label"
            item-value="value"
            density="comfortable"
            variant="outlined"
            hide-details
            @update:model-value="$emit('update:culture', String($event ?? ''))"
          >
            <template #selection="{ item }">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ item.raw.flag }}</span>
                <span>{{ item.raw.label }}</span>
              </div>
            </template>

            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps">
                <template #prepend>
                  <span class="text-base">{{ item.raw.flag }}</span>
                </template>

                <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-select>

          <v-text-field
            :model-value="name"
            :label="t('exerciseLibrary.translationDialog.fields.name')"
            :placeholder="t('exerciseLibrary.translationDialog.placeholders.name')"
            density="comfortable"
            variant="outlined"
            hide-details
            @update:model-value="$emit('update:name', String($event ?? ''))"
          />
        </div>
      </v-card-text>

      <v-card-actions class="justify-end gap-3 px-6 pb-6">
        <v-btn variant="outlined" color="primary" @click="$emit('close')">
          {{ t("exerciseLibrary.actions.cancel") }}
        </v-btn>
        <v-btn color="primary" :loading="isSubmitting" @click="$emit('save')">
          {{ t("exerciseLibrary.actions.saveTranslation") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { TranslationLocaleOption } from "./types";

defineProps<{
  modelValue: boolean;
  exerciseName: string;
  culture: string;
  name: string;
  localeOptions: TranslationLocaleOption[];
  isSubmitting: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  "update:culture": [value: string];
  "update:name": [value: string];
  close: [];
  save: [];
}>();

const { t } = useI18n();
</script>
