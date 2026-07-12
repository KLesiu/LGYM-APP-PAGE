<template>
  <v-dialog :model-value="modelValue" max-width="720" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="lgym-form-shell rounded-xl shadow-none">
      <div class="lgym-form-header">
        <p class="lgym-form-eyebrow">
          {{ isEditing ? t("exerciseLibrary.dialog.editEyebrow") : t("exerciseLibrary.dialog.eyebrow") }}
        </p>
        <h3 class="lgym-form-title text-xl">
          {{ isEditing ? t("exerciseLibrary.dialog.editTitle") : t("exerciseLibrary.dialog.title") }}
        </h3>
        <p class="lgym-form-subtitle">
          {{ t("exerciseLibrary.dialog.subtitle") }}
        </p>
      </div>

      <v-card-text class="lgym-form-body">
        <div class="lgym-form-section grid gap-5">
          <v-select
            v-if="showVisibilityField"
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

          <v-select
            v-if="showFormulaField"
            :model-value="draft.eloFormula"
            :label="t('exerciseLibrary.dialog.fields.eloFormula')"
            :items="formulaOptions"
            item-title="label"
            item-value="value"
            density="comfortable"
            variant="outlined"
            hide-details
            :disabled="isEditing && !canEditFormula"
            :hint="formulaHint"
            persistent-hint
            @update:model-value="updateFormula"
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
            v-if="draft.source === 'global'"
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

      <v-card-actions class="lgym-form-actions border-t-0 pt-0">
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

const props = defineProps<{
  modelValue: boolean;
  isEditing: boolean;
  draft: ExerciseDraft;
  bodyPartOptions: SelectOption[];
  formulaOptions: SelectOption[];
  isLoadingBodyParts: boolean;
  isSubmitting: boolean;
  showFormulaField: boolean;
  showVisibilityField: boolean;
  canEditFormula: boolean;
}>();

const emit = defineEmits<{
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

const formulaHint = computed(() =>
  t("exerciseLibrary.dialog.formulaHint"),
);

const updateFormula = (value: unknown) => {
  const nextFormula = String(value ?? "") as ExerciseDraft["eloFormula"];
  if (!nextFormula) return;

  emit("update:draft", {
    ...props.draft,
    eloFormula: nextFormula,
  });
};
</script>
