<template>
  <v-dialog
    :model-value="Boolean(dialogState?.open)"
    max-width="560"
    @update:model-value="handleModelUpdate"
  >
    <v-card v-if="dialogState" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-6 py-5">
        <p
          v-if="dialogState.eyebrow"
          class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]"
        >
          {{ dialogState.eyebrow }}
        </p>
        <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
          {{ dialogState.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ dialogState.description }}
        </p>
      </div>

      <v-card-actions class="justify-end gap-3 px-6 py-5">
        <v-btn variant="outlined" color="primary" @click="close()">
          {{ dialogState.cancelLabel }}
        </v-btn>
        <v-btn :color="dialogState.confirmColor" @click="accept()">
          {{ dialogState.confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useConfirmDialog } from "../../composables/useConfirmDialog";

const { dialogState, close, accept } = useConfirmDialog();

const handleModelUpdate = (value: boolean) => {
  if (!value) {
    close();
  }
};
</script>
