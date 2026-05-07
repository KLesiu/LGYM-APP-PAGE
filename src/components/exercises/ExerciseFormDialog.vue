<template>
  <v-dialog :model-value="modelValue" max-width="720" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-6 py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
          {{ isEditing ? t("exerciseLibrary.dialog.editEyebrow") : t("exerciseLibrary.dialog.eyebrow") }}
        </p>
        <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
          {{ isEditing ? t("exerciseLibrary.dialog.editTitle") : t("exerciseLibrary.dialog.title") }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("exerciseLibrary.dialog.subtitle") }}
        </p>
      </div>

      <v-card-text class="px-6 py-6">
        <div class="grid gap-5">
          <v-select
            :model-value="draft.source"
            :label="t('exerciseLibrary.dialog.fields.visibility')"
            :items="createTargetOptions"
            item-title="label"
            item-value="value"
            density="comfortable"
            variant="outlined"
            hide-details
            :disabled="isEditing"
            @update:model-value="$emit('update:draft', { ...draft, source: $event ?? 'global' })"
          />

          <v-text-field
            :model-value="draft.name"
            :label="t('exerciseLibrary.dialog.fields.name')"
            :placeholder="t('exerciseLibrary.dialog.placeholders.name')"
            density="comfortable"
            variant="outlined"
            hide-details
            @update:model-value="$emit('update:draft', { ...draft, name: String($event ?? '') })"
          />

          <v-select
            :model-value="draft.bodyPart"
            :label="t('exerciseLibrary.dialog.fields.bodyPart')"
            :items="bodyPartOptions"
            item-title="label"
            item-value="value"
            density="comfortable"
            variant="outlined"
            hide-details
            :loading="isLoadingBodyParts"
            @update:model-value="$emit('update:draft', { ...draft, bodyPart: String($event ?? '') })"
          />

          <v-textarea
            :model-value="draft.description"
            :label="t('exerciseLibrary.dialog.fields.description')"
            :placeholder="t('exerciseLibrary.dialog.placeholders.description')"
            density="comfortable"
            variant="outlined"
            rows="4"
            auto-grow
            hide-details
            @update:model-value="$emit('update:draft', { ...draft, description: String($event ?? '') })"
          />

          <v-text-field
            :model-value="draft.image"
            :label="t('exerciseLibrary.dialog.fields.image')"
            :placeholder="t('exerciseLibrary.dialog.placeholders.image')"
            density="comfortable"
            variant="outlined"
            hide-details
            @update:model-value="$emit('update:draft', { ...draft, image: String($event ?? '') })"
          />
        </div>
      </v-card-text>

      <v-card-actions class="justify-end gap-3 px-6 pb-6">
        <v-btn variant="outlined" color="primary" @click="$emit('close')">
          {{ t("exerciseLibrary.actions.cancel") }}
        </v-btn>
        <v-btn color="primary" :loading="isSubmitting" @click="$emit('save')">
          {{ t("exerciseLibrary.actions.save") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { ExerciseDraft, SelectOption } from "./types";

defineProps<{
  modelValue: boolean;
  isEditing: boolean;
  draft: ExerciseDraft;
  bodyPartOptions: SelectOption[];
  isLoadingBodyParts: boolean;
  isSubmitting: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  "update:draft": [value: ExerciseDraft];
  close: [];
  save: [];
}>();

const { t } = useI18n();

const createTargetOptions = computed(() => [
  { value: "global", label: t("exerciseLibrary.dialog.visibilityOptions.global") },
  { value: "user", label: t("exerciseLibrary.dialog.visibilityOptions.user") },
]);
</script>
