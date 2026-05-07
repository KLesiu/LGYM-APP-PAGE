<template>
  <section class="h-fit overflow-hidden rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4">
        <div class="max-w-3xl">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
            {{ t("trainerTrainingPlanDetails.share.eyebrow") }}
          </p>
        <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
          {{ t("trainerTrainingPlanDetails.share.title") }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("trainerTrainingPlanDetails.share.subtitle") }}
        </p>
      </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <v-btn
            color="primary"
            class="min-h-10 rounded-md px-4"
            :loading="isSharing"
            @click="$emit('generate')"
          >
            {{
              shareCode
                ? t("trainerTrainingPlanDetails.share.actions.regenerate")
                : t("trainerTrainingPlanDetails.share.actions.generate")
            }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="!shareCode"
            @click="$emit('copy')"
          >
            {{ t("trainerTrainingPlanDetails.share.actions.copy") }}
          </v-btn>
        </div>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5 lg:px-6">
      <div
        v-if="shareCode"
        class="flex flex-col gap-3 rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-4"
      >
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
            {{ t("trainerTrainingPlanDetails.share.codeLabel") }}
          </p>
          <p class="mt-2 break-all font-mono text-sm font-semibold text-[var(--lgym-text)]">
            {{ shareCode }}
          </p>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-[var(--lgym-border)] px-4 py-6 text-sm text-[var(--lgym-text-muted)]"
      >
        {{ t("trainerTrainingPlanDetails.share.empty") }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  shareCode: string | null;
  isSharing: boolean;
}>();

defineEmits<{
  generate: [];
  copy: [];
}>();

const { t } = useI18n();
</script>
