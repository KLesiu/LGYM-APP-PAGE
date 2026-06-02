<template>
  <div class="grid gap-5 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
    <section
      class="min-h-0 rounded-2xl border-r border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] p-5  sm:p-6"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.trainings.eyebrow") }}
        </p>
        <h2 class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
          {{ t("trainerMemberDetails.trainings.title") }}
        </h2>
      </div>

      <v-progress-linear v-if="isLoadingDates" indeterminate color="primary" class="mt-4" />

      <div class="min-h-0 pt-4">
        <div v-if="hasDatesError && !isLoadingDates" class="rounded-2xl border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainings.error.subtitle") }}
          </p>
          <v-btn class="mt-4 rounded-md px-4" color="primary" variant="outlined" @click="loadTrainingDates">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <div v-else-if="trainingDates.length > 0" class="overflow-hidden rounded-xl bg-[var(--lgym-note-bg)]">
          <button
            v-for="dateValue in trainingDates"
            :key="dateValue"
            type="button"
          class="w-full border-l-2 border-transparent px-4 py-4 text-left transition-colors duration-150 not-last:border-b not-last:border-[var(--lgym-border)]"
            :class="
              selectedDate === dateValue
                ? 'border-l-[var(--lgym-primary)] bg-[var(--lgym-surface)]'
                : 'hover:bg-[var(--lgym-surface)]'
            "
            @click="selectedDate = dateValue"
          >
            <div class="flex items-start gap-3">
          <div class="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--lgym-note-icon-bg)] text-[var(--lgym-note-icon-text)]">
                <v-icon icon="mdi-calendar-month-outline" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold sm:text-base" :class="selectedDate === dateValue ? 'text-[var(--lgym-primary)]' : 'text-[var(--lgym-text)]'">
                  {{ formatLongDate(dateValue) }}
                </p>
                <p class="mt-1 text-xs text-[var(--lgym-text-muted)] sm:text-sm">
                  {{ formatTime(dateValue) }}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div v-else class="rounded-2xl border border-dashed border-[var(--lgym-border)] px-6 py-12 text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.trainings.empty.title") }}
        </div>
      </div>
    </section>

    <section class="min-h-0">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.trainings.detailsEyebrow") }}
        </p>
        <h2 class="mt-3 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
          {{ selectedDate ? formatTrainingTitle(selectedDate) : t("trainerMemberDetails.trainings.selectDate") }}
        </h2>
      </div>

      <v-progress-linear v-if="isLoadingDetails" indeterminate color="primary" class="mt-4" />

      <div class="mt-6 flex flex-col gap-6">
        <div v-if="hasDetailsError && !isLoadingDetails" class="rounded-2xl border border-dashed border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-6 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainings.error.details") }}
          </p>
          <v-btn class="mt-4" color="primary" variant="outlined" @click="loadTrainingDetails">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <div v-else-if="!selectedTraining && !isLoadingDetails" class="rounded-2xl border border-dashed border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.trainings.empty.details") }}
        </div>

        <article
          v-else-if="selectedTraining"
          :key="getTrainingKey(selectedTraining, 0)"
          class="overflow-hidden rounded-2xl bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
        >
      <div class="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
            <div v-if="selectedTraining.planDay?.name" class="flex flex-wrap items-start justify-between gap-3">
              <div
                class="inline-flex items-center rounded-full bg-[var(--lgym-note-bg)] px-3 py-1 text-xs font-medium text-[var(--lgym-text-muted)]"
              >
                {{ selectedTraining.planDay.name }}
              </div>
            </div>

            <dl class="mt-5 grid gap-3 md:grid-cols-3">
            <div class="rounded-xl bg-[var(--lgym-note-bg)] px-4 py-4">
                <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.trainings.summary.startTime") }}
                </dt>
                <dd class="mt-3 text-base font-semibold text-[var(--lgym-text)]">
                  {{ formatTime(selectedTraining.createdAt) }}
                </dd>
              </div>

            <div class="rounded-xl bg-[var(--lgym-note-bg)] px-4 py-4">
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.trainings.summary.gym") }}
                </dt>
                <dd class="mt-3 text-base font-semibold text-[var(--lgym-text)]">
                  {{ selectedTraining.gym || t("trainerMemberDetails.trainings.fallback.noGym") }}
                </dd>
              </div>

            <div class="rounded-xl bg-[var(--lgym-note-bg)] px-4 py-4">
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.trainings.summary.exercisesCount") }}
                </dt>
                <dd class="mt-3 text-base font-semibold text-[var(--lgym-text)]">
                  {{ selectedTraining.exercises?.length ?? 0 }}
                </dd>
              </div>
            </dl>

            <section class="mt-8">
              <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.trainings.exerciseList") }}
              </h3>

              <div v-if="selectedTraining.exercises?.length" class="mt-5 grid gap-6">
                <article
                  v-for="(exercise, exerciseIndex) in selectedTraining.exercises"
                  :key="getExerciseKey(exercise, exerciseIndex, selectedTraining, 0)"
          class="rounded-xl bg-[var(--lgym-note-bg)] px-5 py-5"
                >
                  <p class="text-lg font-semibold text-[var(--lgym-text)]">
                    {{ exercise.exerciseDetails?.name || t("trainerMemberDetails.trainings.fallback.noExercise") }}
                  </p>
                  <p class="mt-1 text-sm text-[var(--lgym-text-muted)]">
                    {{ exercise.exerciseDetails?.bodyPart?.displayName || exercise.exerciseDetails?.bodyPart?.name || t("trainerMemberDetails.trainings.fallback.noBodyPart") }}
                  </p>

                  <div
                    v-if="exercise.scoresDetails?.length"
                    class="mt-4 overflow-hidden rounded-lg bg-transparent"
                  >
                    <div
                      v-for="(score, scoreIndex) in exercise.scoresDetails"
                      :key="getScoreKey(score, scoreIndex)"
                      class="flex flex-col gap-1 px-4 py-3 not-last:border-b not-last:border-[var(--lgym-border)] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span class="text-sm font-medium text-[var(--lgym-text)]">
                        {{ t("trainerMemberDetails.trainings.seriesLabel", { series: score.series ?? scoreIndex + 1 }) }}
                      </span>
                      <span class="text-sm text-[var(--lgym-text-muted)] sm:text-right">
                        {{ formatScoreSummary(score, scoreIndex) }}
                      </span>
                    </div>
                  </div>

                  <p v-else class="mt-4 text-sm text-[var(--lgym-text-muted)]">
                    {{ t("trainerMemberDetails.trainings.empty.series") }}
                  </p>
                </article>
              </div>

              <p v-else class="mt-5 text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerMemberDetails.trainings.empty.exercises") }}
              </p>
            </section>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import {
  getApiTrainerTraineesTraineeIdTrainingsDates,
  postApiTrainerTraineesTraineeIdTrainingsByDate,
} from "../../../api/generated/demo";
import type { ExerciseScoreResponseDto, TrainingByDateDetailsDto } from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";

const props = defineProps<{
  traineeId: string;
  formatDate: (value: string | null | undefined) => string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t, locale } = useI18n();

const trainingDates = ref<string[]>([]);
const selectedDate = ref<string | null>(null);
const selectedTrainings = ref<TrainingByDateDetailsDto[]>([]);
const isLoadingDates = ref(false);
const isLoadingDetails = ref(false);
const hasDatesError = ref(false);
const hasDetailsError = ref(false);

let datesToken = 0;
let detailsToken = 0;

const getUserLocale = () => (locale.value === "pl" ? "pl-PL" : "en-US");

const formatLongDate = (value: string | null | undefined) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(getUserLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const formatTime = (value: string | null | undefined) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(getUserLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const formatTrainingTitle = (value: string | null | undefined) =>
  t("trainerMemberDetails.trainings.summary.trainingDate", {
    date: formatLongDate(value),
  });

const normalizeDateValue = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

const sortTrainingsDescending = (values: TrainingByDateDetailsDto[]) =>
  [...values].sort(
    (left, right) =>
      new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime(),
  );

const selectedTraining = computed(() => {
  if (selectedTrainings.value.length === 0) return null;

  const selectedDateValue = normalizeDateValue(selectedDate.value);
  const exactMatch = selectedTrainings.value.find(
    (training) => normalizeDateValue(training.createdAt) === selectedDateValue,
  );

  return exactMatch ?? selectedTrainings.value[0] ?? null;
});

const formatScoreValue = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "0";

  return new Intl.NumberFormat(getUserLocale(), {
    maximumFractionDigits: 2,
  }).format(value);
};

const formatScoreSummary = (
  score: ExerciseScoreResponseDto,
  scoreIndex: number,
) => {
  const weight = formatScoreValue(score.weight);
  const reps = score.reps ?? 0;
  const unit = score.unit?.displayName || score.unit?.name || "";

  return t("trainerMemberDetails.trainings.seriesValue", {
    series: score.series ?? scoreIndex + 1,
    weight,
    unit,
    reps,
  });
};

const sortDatesDescending = (values: string[]) =>
  [...values].sort(
    (left, right) => new Date(right).getTime() - new Date(left).getTime(),
  );

const getTrainingKey = (
  training: TrainingByDateDetailsDto,
  trainingIndex: number,
) => [
  selectedDate.value ?? "no-date",
  training._id ?? training.createdAt ?? "no-training-id",
  trainingIndex,
].join(":");

const getExerciseKey = (
  exercise: NonNullable<TrainingByDateDetailsDto["exercises"]>[number],
  exerciseIndex: number,
  training: TrainingByDateDetailsDto,
  trainingIndex: number,
) => [
  getTrainingKey(training, trainingIndex),
  exercise.exerciseScoreId ?? exercise.exerciseDetails?._id ?? `exercise-${exerciseIndex}`,
  exerciseIndex,
].join(":");

const getScoreKey = (
  score: ExerciseScoreResponseDto,
  scoreIndex: number,
) =>
  score._id ??
  [
    score.series ?? scoreIndex + 1,
    score.reps ?? 0,
    score.weight ?? 0,
    scoreIndex,
  ].join(":");

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
  const requestedDate = selectedDate.value;
  const currentToken = ++detailsToken;

  if (!props.traineeId || !requestedDate) {
    selectedTrainings.value = [];
    isLoadingDetails.value = false;
    hasDetailsError.value = false;
    return;
  }

  selectedTrainings.value = [];
  isLoadingDetails.value = true;
  hasDetailsError.value = false;

  try {
    const response = await postApiTrainerTraineesTraineeIdTrainingsByDate(
      props.traineeId,
      { createdAt: requestedDate },
    );

    if (currentToken !== detailsToken) return;

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) console.error(message);
      hasDetailsError.value = true;
      return;
    }

    selectedTrainings.value = sortTrainingsDescending(response.data ?? []);
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
