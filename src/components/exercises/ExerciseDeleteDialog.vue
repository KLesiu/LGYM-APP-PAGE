<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="lgym-form-shell rounded-xl shadow-none">
      <div class="lgym-form-header">
        <p class="lgym-form-eyebrow">
          {{ t("exerciseLibrary.deleteDialog.eyebrow") }}
        </p>
        <h3 class="lgym-form-title text-xl">
          {{ t("exerciseLibrary.deleteDialog.title") }}
        </h3>
        <p class="lgym-form-subtitle">
          {{ t("exerciseLibrary.deleteDialog.description", { name: exerciseName }) }}
        </p>
      </div>

      <v-card-actions class="lgym-form-actions">
        <v-btn variant="outlined" color="primary" @click="$emit('close')">
          {{ t("exerciseLibrary.actions.cancel") }}
        </v-btn>
        <v-btn color="error" :loading="isDeleting" @click="$emit('confirm')">
          {{ t("exerciseLibrary.actions.confirmDelete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  modelValue: boolean;
  exerciseName: string;
  isDeleting: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
  confirm: [];
}>();

const { t } = useI18n();
</script>
