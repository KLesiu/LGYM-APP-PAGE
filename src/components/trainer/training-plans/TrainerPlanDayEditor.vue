<template>
  <section class="overflow-hidden border-y border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/40">
    <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 lg:px-6">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
            {{ t("trainerTrainingPlanDetails.editor.eyebrow") }}
          </p>
          <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
            {{
              draft._id
                ? t("trainerTrainingPlanDetails.editor.title")
                : t("trainerTrainingPlanDetails.editor.createTitle")
            }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
            {{ t("trainerTrainingPlanDetails.editor.subtitle") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <v-btn
            variant="outlined"
            color="primary"
            class="min-h-10 rounded-md px-4"
            :disabled="isSaving"
            @click="$emit('reset')"
          >
            {{ t("trainerTrainingPlanDetails.editor.actions.reset") }}
          </v-btn>
          <v-btn
            color="primary"
            class="min-h-10 rounded-md px-4"
            :loading="isSaving"
            @click="$emit('save')"
          >
            {{ t("trainerTrainingPlanDetails.editor.actions.save") }}
          </v-btn>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <div v-if="hasError && !isLoading" class="px-4 py-8 text-center sm:px-5 lg:px-6">
      <p class="text-sm text-[var(--lgym-text-muted)]">
        {{ t("trainerTrainingPlanDetails.editor.error.load") }}
      </p>
      <v-btn class="mt-4" variant="outlined" color="primary" @click="$emit('retry')">
        {{ t("trainerTrainingPlanDetails.actions.retry") }}
      </v-btn>
    </div>

    <div v-else class="px-4 py-4 sm:px-5 lg:px-6">
      <div class="grid gap-4 border-b border-[var(--lgym-border)] pb-5 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-end">
        <v-text-field
          :model-value="draft.name ?? ''"
          :label="t('trainerTrainingPlanDetails.editor.fields.name')"
          :placeholder="t('trainerTrainingPlanDetails.editor.fields.namePlaceholder')"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="$emit('update:name', String($event ?? ''))"
        />
        <div class="text-xs text-[var(--lgym-text-muted)] lg:justify-self-end">
          {{ t("trainerTrainingPlanDetails.editor.meta.rows", { count: draft.exercises?.length ?? 0 }) }}
        </div>
      </div>

      <div class="pt-6">
        <div class="mb-4 flex items-center justify-between gap-4 border-b border-[var(--lgym-border)] pb-3">
          <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
            {{ t("trainerTrainingPlanDetails.editor.exerciseRowsTitle") }}
          </h4>
          <v-btn size="small" variant="outlined" class="rounded-md px-3.5" prepend-icon="mdi-plus" @click="$emit('add-row')">
            {{ t("trainerTrainingPlanDetails.editor.actions.addExercise") }}
          </v-btn>
        </div>

        <div class="hidden border-b border-[var(--lgym-border)] py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)] lg:grid lg:grid-cols-[minmax(0,1.6fr)_120px_120px_52px] lg:gap-x-4">
          <span>{{ t("trainerTrainingPlanDetails.editor.columns.exercise") }}</span>
          <span>{{ t("trainerTrainingPlanDetails.editor.columns.reps") }}</span>
          <span>{{ t("trainerTrainingPlanDetails.editor.columns.series") }}</span>
          <span class="text-right">#</span>
        </div>

        <div class="divide-y divide-[var(--lgym-border)]">
          <div
            v-for="(row, index) in draft.exercises ?? []"
            :key="`${row.exercise || 'row'}-${index}`"
            class="py-4 transition-colors hover:bg-[var(--lgym-note-bg)]/28"
          >
            <div class="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_120px_120px_52px] lg:items-center lg:gap-x-4">
              <v-select
                :model-value="row.exercise ?? null"
                :items="exerciseItems"
                item-title="label"
                item-value="value"
                :label="t('trainerTrainingPlanDetails.editor.columns.exercise')"
                density="compact"
                variant="outlined"
                hide-details
                :loading="isLoadingExercises"
                @update:model-value="$emit('update:exercise', { index, value: $event ? String($event) : null })"
              />
              <v-text-field
                :model-value="row.reps ?? ''"
                :label="t('trainerTrainingPlanDetails.editor.columns.reps')"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="$emit('update:reps', { index, value: String($event ?? '') })"
              />
              <v-text-field
                :model-value="row.series ?? 0"
                type="number"
                min="0"
                :label="t('trainerTrainingPlanDetails.editor.columns.series')"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="$emit('update:series', { index, value: Number($event ?? 0) })"
              />
              <div class="flex min-h-11 items-center justify-end">
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  :disabled="(draft.exercises?.length ?? 0) <= 1"
                  @click="$emit('remove-row', index)"
                />
              </div>
            </div>
          </div>

          <div
            v-if="hasExercisesError"
            class="py-5 text-sm text-[var(--lgym-text-muted)]"
          >
            {{ t("trainerTrainingPlanDetails.editor.error.exercises") }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { ExerciseResponseDto, PlanDayFormDto } from "../../../api/model";

const props = defineProps<{
  draft: PlanDayFormDto;
  exercises: ExerciseResponseDto[];
  isLoading: boolean;
  hasError: boolean;
  isSaving: boolean;
  isLoadingExercises: boolean;
  hasExercisesError: boolean;
}>();

defineEmits<{
  retry: [];
  reset: [];
  save: [];
  "update:name": [value: string];
  "update:exercise": [value: { index: number; value: string | null }];
  "update:reps": [value: { index: number; value: string }];
  "update:series": [value: { index: number; value: number }];
  "add-row": [];
  "remove-row": [index: number];
}>();

const { t } = useI18n();

const exerciseItems = computed(() =>
  props.exercises.map((exercise) => ({
    value: exercise._id ?? "",
    label: [
      exercise.name?.trim() || t("trainerTrainingPlanDetails.exercises.fallback.noName"),
      exercise.bodyPart?.displayName || exercise.bodyPart?.name || null,
    ]
      .filter(Boolean)
      .join(" · "),
  })),
);
</script>
