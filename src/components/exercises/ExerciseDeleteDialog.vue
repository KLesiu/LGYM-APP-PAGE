<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-6 py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
          {{ t("exerciseLibrary.deleteDialog.eyebrow") }}
        </p>
        <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
          {{ t("exerciseLibrary.deleteDialog.title") }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("exerciseLibrary.deleteDialog.description", { name: exerciseName }) }}
        </p>
      </div>

      <v-card-actions class="justify-end gap-3 px-6 py-5">
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
