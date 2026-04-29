<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
    <v-card class="overflow-hidden rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.trainings.eyebrow") }}
        </p>
        <h2 class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
          {{ t("trainerMemberDetails.trainings.title") }}
        </h2>
      </div>

      <v-progress-linear v-if="isLoadingDates" indeterminate color="primary" />

      <v-card-text class="min-h-0 px-0 py-0">
        <div v-if="hasDatesError && !isLoadingDates" class="p-4 sm:p-6 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainings.error.subtitle") }}
          </p>
          <v-btn class="mt-4 rounded-md px-4" color="primary" variant="outlined" @click="loadTrainingDates">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <v-list v-else-if="trainingDates.length > 0" class="bg-transparent py-0">
          <v-list-item
            v-for="dateValue in trainingDates"
            :key="dateValue"
            :active="selectedDate === dateValue"
            rounded="md"
            class="mx-2 my-1 rounded-md"
            @click="selectedDate = dateValue"
          >
            <template #prepend>
              <v-icon icon="mdi-calendar-month-outline" />
            </template>
            <v-list-item-title class="text-sm font-semibold">
              {{ formatDate(dateValue) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDateTime(dateValue) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <div v-else class="px-6 py-12 text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.trainings.empty.title") }}
        </div>
      </v-card-text>
    </v-card>

    <v-card class="overflow-hidden rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.trainings.detailsEyebrow") }}
        </p>
        <h2 class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
          {{ selectedDate ? formatDate(selectedDate) : t("trainerMemberDetails.trainings.selectDate") }}
        </h2>
      </div>

      <v-progress-linear v-if="isLoadingDetails" indeterminate color="primary" />

      <v-card-text class="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div v-if="hasDetailsError && !isLoadingDetails" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainings.error.details") }}
          </p>
          <v-btn class="mt-4" color="primary" variant="outlined" @click="loadTrainingDetails">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <div v-else-if="selectedTrainings.length === 0" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.trainings.empty.details") }}
        </div>

        <article
          v-for="training in selectedTrainings"
          :key="training._id || training.createdAt || 'training'"
          class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4"
        >
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                  {{ training.type || t("trainerMemberDetails.trainings.fallback.noType") }}
                </h3>
                <p class="mt-1 text-sm text-[var(--lgym-text-muted)]">
                  {{ formatDateTime(training.createdAt) }}
                </p>
              </div>
              <v-chip color="primary" variant="outlined">
                {{ training.planDay?.name || t("trainerMemberDetails.trainings.fallback.noPlanDay") }}
              </v-chip>
            </div>

            <dl class="grid gap-4 md:grid-cols-2">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.trainings.columns.gym") }}
                </dt>
                <dd class="mt-2 text-sm text-[var(--lgym-text)]">
                  {{ training.gym || t("trainerMemberDetails.trainings.fallback.noGym") }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.trainings.columns.exercises") }}
                </dt>
                <dd class="mt-2 text-sm text-[var(--lgym-text)]">
                  {{ training.exercises?.length ?? 0 }}
                </dd>
              </div>
            </dl>

            <div class="space-y-3">
              <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.trainings.exerciseList") }}
              </h4>

              <div
                v-if="training.exercises?.length"
                class="grid gap-3"
              >
                <div
                  v-for="exercise in training.exercises"
                  :key="exercise.exerciseScoreId || exercise.exerciseDetails?._id || 'exercise'"
                   class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] p-4"
                >
                  <div class="flex flex-col gap-2">
                    <p class="font-semibold text-[var(--lgym-text)]">
                      {{ exercise.exerciseDetails?.name || t("trainerMemberDetails.trainings.fallback.noExercise") }}
                    </p>
                    <p class="text-sm text-[var(--lgym-text-muted)]">
                      {{ exercise.exerciseDetails?.bodyPart?.displayName || exercise.exerciseDetails?.bodyPart?.name || t("trainerMemberDetails.trainings.fallback.noBodyPart") }}
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <v-chip
                        v-for="score in exercise.scoresDetails || []"
                        :key="score._id || `${score.series}-${score.reps}-${score.weight}`"
                        size="small"
                        variant="outlined"
                      >
                        {{ score.series ?? 0 }}x{{ score.reps ?? 0 }} · {{ score.weight ?? 0 }} {{ score.unit?.displayName || score.unit?.name || "" }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>

              <p v-else class="text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerMemberDetails.trainings.empty.exercises") }}
              </p>
            </div>
          </div>
        </article>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import {
  getApiTrainerTraineesTraineeIdTrainingsDates,
  postApiTrainerTraineesTraineeIdTrainingsByDate,
} from "../../../api/generated/demo";
import type { TrainingByDateDetailsDto } from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";

const props = defineProps<{
  traineeId: string;
  formatDate: (value: string | null | undefined) => string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();

const trainingDates = ref<string[]>([]);
const selectedDate = ref<string | null>(null);
const selectedTrainings = ref<TrainingByDateDetailsDto[]>([]);
const isLoadingDates = ref(false);
const isLoadingDetails = ref(false);
const hasDatesError = ref(false);
const hasDetailsError = ref(false);

let datesToken = 0;
let detailsToken = 0;

const sortDatesDescending = (values: string[]) =>
  [...values].sort(
    (left, right) => new Date(right).getTime() - new Date(left).getTime(),
  );

const loadTrainingDates = async () => {
  if (!props.traineeId) return;

  const currentToken = ++datesToken;
  isLoadingDates.value = true;
  hasDatesError.value = false;

  try {
    const response = await getApiTrainerTraineesTraineeIdTrainingsDates(
      props.traineeId,
    );

    if (currentToken !== datesToken) return;

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) console.error(message);
      hasDatesError.value = true;
      return;
    }

    trainingDates.value = sortDatesDescending(response.data ?? []);
    selectedDate.value = trainingDates.value[0] ?? null;
  } catch (error) {
    if (currentToken !== datesToken) return;

    console.error(error);
    hasDatesError.value = true;
  } finally {
    if (currentToken === datesToken) {
      isLoadingDates.value = false;
    }
  }
};

const loadTrainingDetails = async () => {
  if (!props.traineeId || !selectedDate.value) {
    selectedTrainings.value = [];
    return;
  }

  const currentToken = ++detailsToken;
  isLoadingDetails.value = true;
  hasDetailsError.value = false;

  try {
    const response = await postApiTrainerTraineesTraineeIdTrainingsByDate(
      props.traineeId,
      { createdAt: selectedDate.value },
    );

    if (currentToken !== detailsToken) return;

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) console.error(message);
      hasDetailsError.value = true;
      return;
    }

    selectedTrainings.value = response.data ?? [];
  } catch (error) {
    if (currentToken !== detailsToken) return;

    console.error(error);
    hasDetailsError.value = true;
  } finally {
    if (currentToken === detailsToken) {
      isLoadingDetails.value = false;
    }
  }
};

watch(
  () => props.traineeId,
  () => {
    trainingDates.value = [];
    selectedDate.value = null;
    selectedTrainings.value = [];
    void loadTrainingDates();
  },
  { immediate: true },
);

watch(selectedDate, () => {
  void loadTrainingDetails();
});
</script>
