<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <v-card class="overflow-hidden rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
              {{ t("trainerMemberDetails.measurements.eyebrow") }}
            </p>
            <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
              {{ t("trainerMemberDetails.measurements.title") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.measurements.subtitle") }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <v-select
              v-model="bodyPart"
              :items="bodyPartOptions"
              item-title="label"
              item-value="value"
              :label="t('trainerMemberDetails.measurements.filters.bodyPart')"
              hide-details
              class="min-w-[180px]"
            />
            <v-select
              v-model="unit"
              :items="unitOptions"
              item-title="label"
              item-value="value"
              :label="t('trainerMemberDetails.measurements.filters.unit')"
              hide-details
              class="min-w-[180px]"
            />
          </div>
        </div>
      </div>

      <v-progress-linear v-if="isLoading" indeterminate color="primary" />

      <v-card-text class="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div v-if="hasError && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.measurements.error.subtitle") }}
          </p>
          <v-btn class="mt-4" color="primary" variant="outlined" @click="loadMeasurements">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <template v-else>
           <div class="grid gap-3 md:grid-cols-3">
             <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.measurements.cards.currentValue") }}
              </p>
              <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
                {{ trend?.currentValue ?? t("trainerMemberDetails.measurements.emptyValue") }}
              </p>
            </article>
             <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.measurements.cards.change") }}
              </p>
              <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
                {{ trend?.change ?? t("trainerMemberDetails.measurements.emptyValue") }}
              </p>
            </article>
             <article class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.measurements.cards.changePercentage") }}
              </p>
              <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
                {{ trend?.changePercentage ?? t("trainerMemberDetails.measurements.emptyValue") }}
              </p>
            </article>
          </div>

          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
             <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
              <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                {{ t("trainerMemberDetails.measurements.sections.trend") }}
              </h3>
              <div class="mt-4 grid gap-3">
                <div
                  v-for="point in historyPoints"
                  :key="`${point.createdAt}-${point.value}`"
                   class="flex items-center justify-between rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-4 py-3"
                >
                  <span class="text-sm text-[var(--lgym-text)]">{{ formatDate(point.createdAt) }}</span>
                  <span class="text-sm font-semibold text-[var(--lgym-text)]">{{ point.value }}</span>
                </div>
              </div>
            </div>

             <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
              <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                {{ t("trainerMemberDetails.measurements.sections.latest") }}
              </h3>
              <div class="mt-4 grid gap-3">
                <div
                  v-for="item in measurements"
                  :key="`${item.createdAt}-${item.value}`"
                   class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] p-4"
                >
                  <p class="text-sm font-semibold text-[var(--lgym-text)]">
                    {{ item.bodyPart?.displayName || item.bodyPart?.name || t("trainerMemberDetails.measurements.emptyValue") }}
                  </p>
                  <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                    {{ item.value ?? t("trainerMemberDetails.measurements.emptyValue") }} {{ item.unit?.displayName || item.unit?.name || "" }}
                  </p>
                  <p class="mt-1 text-xs text-[var(--lgym-text-soft)]">
                    {{ formatDateTime(item.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

           <div v-if="measurements.length === 0 && historyPoints.length === 0 && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.measurements.empty.title") }}
          </div>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  getApiMeasurementsIdGetHistory,
  getApiMeasurementsIdList,
  getApiMeasurementsIdTrend,
} from "../../../api/generated/demo";
import {
  GetApiMeasurementsIdGetHistoryBodyPart,
  GetApiMeasurementsIdGetHistoryUnit,
  GetApiMeasurementsIdListBodyPart,
  GetApiMeasurementsIdListUnit,
  GetApiMeasurementsIdTrendBodyPart,
  GetApiMeasurementsIdTrendUnit,
  type MeasurementResponseDto,
  type MeasurementTrendDto,
} from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";

const props = defineProps<{
  traineeId: string;
  formatDate: (value: string | null | undefined) => string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const bodyPart = ref<GetApiMeasurementsIdListBodyPart>(
  GetApiMeasurementsIdListBodyPart.Chest,
);
const unit = ref<GetApiMeasurementsIdListUnit>(
  GetApiMeasurementsIdListUnit.Centimeters,
);
const measurements = ref<MeasurementResponseDto[]>([]);
const historyPoints = ref<MeasurementResponseDto[]>([]);
const trend = ref<MeasurementTrendDto | null>(null);
const isLoading = ref(false);
const hasError = ref(false);

const bodyPartOptions = computed(() =>
  Object.values(GetApiMeasurementsIdListBodyPart).map((value) => ({
    label: value,
    value,
  })),
);

const unitOptions = computed(() =>
  Object.values(GetApiMeasurementsIdListUnit).map((value) => ({
    label: value,
    value,
  })),
);

let requestToken = 0;

const loadMeasurements = async () => {
  if (!props.traineeId) return;

  const currentToken = ++requestToken;
  isLoading.value = true;
  hasError.value = false;

  try {
    const [listResponse, historyResponse, trendResponse] = await Promise.all([
      getApiMeasurementsIdList(props.traineeId, {
        BodyPart: bodyPart.value,
        Unit: unit.value,
      }),
      getApiMeasurementsIdGetHistory(props.traineeId, {
        BodyPart: bodyPart.value as GetApiMeasurementsIdGetHistoryBodyPart,
        Unit: unit.value as GetApiMeasurementsIdGetHistoryUnit,
      }),
      getApiMeasurementsIdTrend(props.traineeId, {
        BodyPart: bodyPart.value as GetApiMeasurementsIdTrendBodyPart,
        Unit: unit.value as GetApiMeasurementsIdTrendUnit,
      }),
    ]);

    if (currentToken !== requestToken) return;

    const responses = [listResponse, historyResponse, trendResponse];
    const authResponse = responses.find((response) => response.status === 403);

    if (
      authResponse &&
      (await handleTrainerUnauthorizedResponse(
        authResponse.status,
        router,
        toast,
        `/trainer/members/${props.traineeId}`,
      ))
    ) {
      return;
    }

    const failedResponse = responses.find(
      (response) => response.status < 200 || response.status >= 300,
    );
    if (failedResponse) {
      const message = getApiErrorMessage(failedResponse.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.measurements.feedback.loadFailed");
      hasError.value = true;
      return;
    }

    measurements.value = listResponse.status === 200 ? (listResponse.data.measurements ?? []) : [];
    historyPoints.value =
      historyResponse.status === 200 ? (historyResponse.data.measurements ?? []) : [];
    trend.value = trendResponse.status === 200 ? trendResponse.data : null;
  } catch (error) {
    if (currentToken !== requestToken) return;

    console.error(error);
    toast.error("trainerMemberDetails.measurements.feedback.loadFailed");
    hasError.value = true;
  } finally {
    if (currentToken === requestToken) {
      isLoading.value = false;
    }
  }
};

watch(
  () => props.traineeId,
  () => {
    measurements.value = [];
    historyPoints.value = [];
    trend.value = null;
    void loadMeasurements();
  },
  { immediate: true },
);

watch([bodyPart, unit], () => {
  void loadMeasurements();
});
</script>
