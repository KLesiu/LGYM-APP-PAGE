<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <section>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerMemberDetails.trainings.eyebrow") }}
          </p>
          <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
            {{ t("trainerMemberDetails.trainings.title") }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
            {{ selectedDate ? formatTrainingTitle(selectedDate) : t("trainerMemberDetails.trainings.selectDate") }}
          </p>
        </div>
      </div>

      <div class="grid gap-5 pt-4 xl:grid-cols-[minmax(340px,380px)_minmax(0,1fr)]">
        <section class="min-h-0 rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4 sm:px-5 sm:py-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
              {{ t("trainerMemberDetails.trainings.eyebrow") }}
            </p>
            <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)]">
              {{ t("trainerMemberDetails.trainings.title") }}
            </h3>
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

            <div v-else-if="trainingDates.length > 0" class="space-y-4">
              <div class="rounded-2xl bg-[var(--lgym-surface-card)] p-2">
                <div class="max-w-full overflow-x-auto pb-1 lgym-training-calendar-scroll">
                  <div class="min-w-[320px]">
                    <v-date-picker
                      :model-value="selectedDayKey"
                      :month="activeDatePickerMonth"
                      :year="activeDatePickerYear"
                      :events="trainingEventDates"
                      color="primary"
                      event-color="primary"
                      first-day-of-week="0"
                      hide-header
                      show-adjacent-months
                      width="100%"
                      class="lgym-training-calendar"
                      @update:model-value="selectDatePickerValue"
                      @update:month="setActiveDatePickerMonth"
                      @update:year="setActiveDatePickerYear"
                    />
                  </div>
                </div>

                <div
                  v-if="activeMonthTrainingCount === 0"
                  class="px-3 py-5 text-center text-sm text-[var(--lgym-text-muted)]"
                >
                  {{ t("trainerMemberDetails.trainings.monthSelector.empty") }}
                </div>
              </div>
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
            <h3 class="mt-2 text-lg font-semibold text-[var(--lgym-text)] sm:text-xl">
              {{ selectedDate ? formatTrainingTitle(selectedDate) : t("trainerMemberDetails.trainings.selectDate") }}
            </h3>
          </div>

          <v-progress-linear v-if="isLoadingDetails" indeterminate color="primary" class="mt-4" />

          <div class="mt-4 flex flex-col gap-4">
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
              <div class="space-y-6 flex flex-col gap-2 px-5 py-5 sm:px-6 sm:py-6">
                <div v-if="selectedTraining.planDay?.name" class="flex flex-wrap items-start justify-between gap-3">
                  <div
                    class="inline-flex items-center rounded-full bg-[var(--lgym-note-bg)] px-3 py-1 text-xs font-medium text-[var(--lgym-text-muted)]"
                  >
                    {{ selectedTraining.planDay.name }}
                  </div>
                </div>

                <dl class="grid gap-3 md:grid-cols-3">
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

                <section>
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

type TrainingMonthGroup = {
  key: string;
  label: string;
  dates: string[];
};

const trainingDates = ref<string[]>([]);
const activeMonthKey = ref<string | null>(null);
const selectedDate = ref<string | null>(null);
const selectedPickerDateKey = ref<string | null>(null);
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

const getMonthKey = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getDateKey = (value: string | Date | null | undefined) => {
  if (!value) return null;

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMonthLabel = (value: string | null | undefined) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(getUserLocale(), {
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const availableMonths = computed<TrainingMonthGroup[]>(() => {
  const groups = new Map<string, string[]>();

  for (const dateValue of trainingDates.value) {
    const monthKey = getMonthKey(dateValue);
    if (!monthKey) continue;

    const existingDates = groups.get(monthKey) ?? [];
    existingDates.push(dateValue);
    groups.set(monthKey, existingDates);
  }

  return Array.from(groups.entries()).map(([key, dates]) => ({
    key,
    label: formatMonthLabel(dates[0] ?? null),
    dates,
  }));
});

const visibleTrainingDates = computed(() =>
  trainingDates.value.filter((dateValue) => getMonthKey(dateValue) === activeMonthKey.value),
);

const selectedDayKey = computed(
  () => selectedPickerDateKey.value ?? getDateKey(selectedDate.value),
);

const trainingDatesByDay = computed(() => {
  const datesByDay = new Map<string, string[]>();

  for (const dateValue of trainingDates.value) {
    const dateKey = getDateKey(dateValue);
    if (!dateKey) continue;

    const datesForDay = datesByDay.get(dateKey) ?? [];
    datesForDay.push(dateValue);
    datesByDay.set(dateKey, sortDatesDescending(datesForDay));
  }

  return datesByDay;
});

const activeMonthTrainingCount = computed(() => visibleTrainingDates.value.length);

const trainingEventDates = computed(() => Array.from(trainingDatesByDay.value.keys()));

const getActiveMonthParts = () => {
  if (!activeMonthKey.value) {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  }

  const [yearValue, monthValue] = activeMonthKey.value.split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  }

  return { year, month: monthIndex };
};

const activeDatePickerMonth = computed(() => getActiveMonthParts().month);
const activeDatePickerYear = computed(() => getActiveMonthParts().year);

const setActiveDatePickerMonth = (month: unknown) => {
  const parsedMonth = Number(month);
  if (!Number.isInteger(parsedMonth)) return;

  const { year } = getActiveMonthParts();
  activeMonthKey.value = `${year}-${String(parsedMonth + 1).padStart(2, "0")}`;
};

const setActiveDatePickerYear = (year: unknown) => {
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear)) return;

  const { month } = getActiveMonthParts();
  activeMonthKey.value = `${parsedYear}-${String(month + 1).padStart(2, "0")}`;
};

const selectDatePickerValue = (value: unknown) => {
  const dateValue = Array.isArray(value) ? value[0] : value;
  const dateKey = getDateKey(dateValue as string | Date | null | undefined);

  selectedPickerDateKey.value = dateKey;

  if (!dateKey) {
    selectedDate.value = null;
    selectedTrainings.value = [];
    hasDetailsError.value = false;
    isLoadingDetails.value = false;
    return;
  }

  activeMonthKey.value = getMonthKey(dateKey) ?? activeMonthKey.value;
  selectedDate.value = trainingDatesByDay.value.get(dateKey)?.[0] ?? null;

  if (!selectedDate.value) {
    selectedTrainings.value = [];
    hasDetailsError.value = false;
    isLoadingDetails.value = false;
  }
};

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
    activeMonthKey.value = getMonthKey(trainingDates.value[0] ?? null);
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
    activeMonthKey.value = null;
    selectedDate.value = null;
    selectedPickerDateKey.value = null;
    selectedTrainings.value = [];
    void loadTrainingDates();
  },
  { immediate: true },
);

watch(
  availableMonths,
  (months) => {
    if (months.length === 0) {
      activeMonthKey.value = null;
      selectedPickerDateKey.value = null;
      return;
    }

    if (!activeMonthKey.value) {
      activeMonthKey.value = months[0]?.key ?? null;
    }
  },
  { immediate: true },
);

watch(
  [activeMonthKey, visibleTrainingDates],
  ([, dates]) => {
    if (dates.length === 0) {
      if (selectedDate.value !== null) {
        selectedDate.value = null;
      }

      if (getMonthKey(selectedPickerDateKey.value) !== activeMonthKey.value) {
        selectedPickerDateKey.value = null;
      }
      return;
    }

    if (!selectedDate.value || !dates.includes(selectedDate.value)) {
      selectedDate.value = dates[0] ?? null;
    }

    selectedPickerDateKey.value = getDateKey(selectedDate.value);
  },
  { immediate: true },
);

watch(selectedDate, () => {
  void loadTrainingDetails();
});
</script>
