<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <section>
      <div>
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
              v-model="selectedBodyPart"
              :items="bodyPartOptions"
              item-title="label"
              item-value="value"
              :label="t('trainerMemberDetails.measurements.filters.bodyPart')"
              hide-details
              class="min-w-[180px]"
            />
            <v-select
              v-model="selectedUnit"
              :items="unitOptions"
              item-title="label"
              item-value="value"
              :label="t('trainerMemberDetails.measurements.filters.unit')"
              :disabled="selectedBodyPart === 'ALL' || unitOptions.length === 0"
              hide-details
              class="min-w-[180px]"
            />
          </div>
        </div>
      </div>



      <div class="pt-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200"
          :class="
            activeTab === tab.value
              ? 'border-[var(--lgym-primary)] bg-[var(--lgym-primary)] text-white shadow-sm'
              : 'border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] text-[var(--lgym-text-muted)] hover:border-[var(--lgym-primary)] hover:text-[var(--lgym-primary)]'
          "
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <v-progress-linear v-if="isLoading" class="mt-4" indeterminate color="primary" />

      <div class="flex flex-col gap-4 pt-4">
        <div v-if="hasError && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-3 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.measurements.error.subtitle") }}
          </p>
          <v-btn class="mt-4" color="primary" variant="outlined" @click="loadMeasurements">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <template v-else>
          <template v-if="activeTab === 'trend'">
            <div class="grid gap-3 md:grid-cols-3">
              <article class="rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.measurements.cards.currentValue") }}
                </p>
                <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
                  {{ currentValueLabel }}
                </p>
              </article>
              <article class="rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.measurements.cards.change") }}
                </p>
                <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
                  {{ changeValueLabel }}
                </p>
              </article>
              <article class="rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.measurements.cards.changePercentage") }}
                </p>
               <p class="mt-3 text-xl font-semibold text-[var(--lgym-text)]">
                 {{ changePercentageLabel }}
               </p>
             </article>
            </div>

            <MeasurementLineChart
              :title="t('trainerMemberDetails.measurements.sections.chart')"
              :subtitle="chartSubtitle"
              :min-label="t('trainerMemberDetails.measurements.summary.minimum')"
              :max-label="t('trainerMemberDetails.measurements.summary.maximum')"
              :latest-label="t('trainerMemberDetails.measurements.summary.latest')"
              :empty-message="t('trainerMemberDetails.measurements.empty.chart')"
              :point-count-label="t('trainerMemberDetails.measurements.summary.points', { count: totalChartPointCount })"
              :series="chartSeries"
              :format-value="formatChartValue"
            />
          </template>

          <div
            v-else-if="activeTab === 'latest'"
            class="rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4"
          >
            <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
              {{ t("trainerMemberDetails.measurements.sections.latest") }}
            </h3>
            <div v-if="measurements.length > 0" class="mt-4 grid gap-3">
              <div
                v-for="item in measurements"
                :key="`${item.createdAt}-${item.value}`"
                class="rounded-2xl bg-[var(--lgym-surface-card)] px-4 py-4"
              >
                <p class="text-sm font-semibold text-[var(--lgym-text)]">
                  {{ getMeasurementLabel(item) }}
                </p>
                <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                  {{ formatMeasurementValue(item) }}
                </p>
                <p class="mt-1 text-xs text-[var(--lgym-text-soft)]">
                  {{ formatDateTime(item.createdAt) }}
                </p>
              </div>
            </div>
            <div
              v-else-if="!isLoading"
              class="mt-4 rounded-2xl bg-[var(--lgym-surface-card)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]"
            >
              {{ t("trainerMemberDetails.measurements.empty.title") }}
            </div>
          </div>

          <div
            v-else
            class="rounded-2xl bg-[var(--lgym-note-bg)] px-4 py-4"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                  {{ t("trainerMemberDetails.measurements.sections.history") }}
                </h3>
                <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                  {{ t("trainerMemberDetails.measurements.history.summary", { count: filteredHistoryRows.length }) }}
                </p>
              </div>

              <div class="inline-flex items-center rounded-full bg-[var(--lgym-surface-card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lgym-primary)]">
                {{ selectedBodyPartLabel }}
              </div>
            </div>

            <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <v-text-field
                v-model="historySearch"
                :label="t('trainerMemberDetails.measurements.history.filters.search')"
                :placeholder="t('trainerMemberDetails.measurements.history.placeholders.search')"
                prepend-inner-icon="mdi-magnify"
                clearable
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="var(--lgym-surface-card)"
              />

              <v-select
                v-model="historySort"
                :items="historySortOptions"
                item-title="label"
                item-value="value"
                :label="t('trainerMemberDetails.measurements.history.filters.sort')"
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="var(--lgym-surface-card)"
              />
            </div>

            <div class="mt-4 overflow-hidden rounded-2xl bg-[var(--lgym-surface-card)] measurements-history-shell">
              <AppDataTable
                :headers="historyHeaders"
                :items="filteredHistoryRows"
                :loading="isLoading"
                item-value="key"
                hide-default-footer
                density="compact"
                :hover="false"
                class="measurements-history-table"
              >
                <template #mobile>
                  <div class="divide-y divide-black/5 dark:divide-white/8">
                    <article
                      v-for="row in filteredHistoryRows"
                      :key="row.key"
                      class="px-4 py-4"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-[var(--lgym-text)]">
                            {{ row.measurementLabel }}
                          </p>
                          <p class="mt-1 text-xs text-[var(--lgym-text-soft)]">
                            {{ row.createdAtLabel }}
                          </p>
                        </div>
                        <p class="text-sm font-semibold text-[var(--lgym-text)]">
                          {{ row.measurementValue }}
                        </p>
                      </div>
                    </article>

                    <div
                      v-if="filteredHistoryRows.length === 0 && !isLoading"
                      class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]"
                    >
                      {{ historyEmptyMessage }}
                    </div>
                  </div>
                </template>

                <template #item.createdAt="{ item }">
                  <div class="px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
                    {{ toHistoryRow(item).createdAtLabel }}
                  </div>
                </template>

                <template #item.measurement="{ item }">
                  <div class="px-4 py-4 lg:px-5">
                    <p class="text-sm font-semibold text-[var(--lgym-text)]">
                      {{ toHistoryRow(item).measurementLabel }}
                    </p>
                    <p class="mt-1 text-xs text-[var(--lgym-text-soft)]">
                      {{ toHistoryRow(item).measurementMeta }}
                    </p>
                  </div>
                </template>

                <template #item.value="{ item }">
                  <div class="px-4 py-4 text-sm font-semibold text-[var(--lgym-text)] lg:px-5">
                    {{ toHistoryRow(item).measurementValue }}
                  </div>
                </template>

                <template #no-data>
                  <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
                    {{ historyEmptyMessage }}
                  </div>
                </template>
              </AppDataTable>
            </div>
          </div>
        </template>
      </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import MeasurementLineChart from "./MeasurementLineChart.vue";
import AppDataTable from "../../ui/AppDataTable.vue";
import {
  getApiTrainerTraineesTraineeIdMeasurementsHistory,
  getApiTrainerTraineesTraineeIdMeasurementsList,
  getApiTrainerTraineesTraineeIdMeasurementsTrend,
} from "../../../api/trainerMeasurements";
import {
  type MeasurementsHistoryDto,
  type MeasurementsListDto,
  type MeasurementResponseDto,
  type MeasurementTrendDto,
} from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";
import {
  getDefaultUnitForBodyPart,
  measurementTypeOptions,
  unitOptionsByType,
  type TrainerMeasurementBodyPart,
  type TrainerMeasurementsTabKey,
  type TrainerMeasurementUnit,
} from "./trainerMeasurementsConfig";

const props = defineProps<{
  traineeId: string;
  formatDate: (value: string | null | undefined) => string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const formatDate = (value: string | null | undefined) => props.formatDate(value);
const formatDateTime = (value: string | null | undefined) => props.formatDateTime(value);

const selectedBodyPart = ref<TrainerMeasurementBodyPart>("BodyWeight");
const selectedUnit = ref<TrainerMeasurementUnit | null>(
  getDefaultUnitForBodyPart("BodyWeight"),
);
const activeTab = ref<TrainerMeasurementsTabKey>("trend");
const measurements = ref<MeasurementResponseDto[]>([]);
const historyPoints = ref<MeasurementResponseDto[]>([]);
const trend = ref<MeasurementTrendDto | null>(null);
const isLoading = ref(false);
const hasError = ref(false);
const historySearch = ref("");
const historySort = ref<"newest" | "oldest">("newest");

const chartPalette = [
  "#52b36b",
  "#60a5fa",
  "#f59e0b",
  "#f472b6",
  "#a78bfa",
  "#2dd4bf",
  "#f87171",
  "#facc15",
  "#fb7185",
  "#34d399",
];

const bodyPartOptions = computed(() =>
  measurementTypeOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  })),
);

const unitOptions = computed(() =>
  selectedBodyPart.value === "ALL"
    ? []
    : (unitOptionsByType[selectedBodyPart.value] ?? []).map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
);

const tabs = computed(() => [
  { value: "trend" as const, label: t("trainerMemberDetails.measurements.tabs.trend") },
  { value: "latest" as const, label: t("trainerMemberDetails.measurements.tabs.latest") },
  { value: "history" as const, label: t("trainerMemberDetails.measurements.tabs.history") },
]);

const historyHeaders = computed(() => [
  {
    title: t("trainerMemberDetails.measurements.history.columns.recordedAt"),
    key: "createdAt",
    sortable: false,
  },
  {
    title: t("trainerMemberDetails.measurements.history.columns.measurement"),
    key: "measurement",
    sortable: false,
  },
  {
    title: t("trainerMemberDetails.measurements.history.columns.result"),
    key: "value",
    sortable: false,
    align: "end" as const,
  },
]);

const historySortOptions = computed(() => [
  {
    label: t("trainerMemberDetails.measurements.history.sort.newest"),
    value: "newest" as const,
  },
  {
    label: t("trainerMemberDetails.measurements.history.sort.oldest"),
    value: "oldest" as const,
  },
]);

let requestToken = 0;

const isMeasurementsListDto = (
  value: unknown,
): value is MeasurementsListDto => typeof value === "object" && value !== null && "measurements" in value;

const isMeasurementsHistoryDto = (
  value: unknown,
): value is MeasurementsHistoryDto =>
  typeof value === "object" && value !== null && "measurements" in value;

const isMeasurementTrendDto = (
  value: unknown,
): value is MeasurementTrendDto => typeof value === "object" && value !== null && "currentValue" in value;

const queryParams = computed(() =>
  selectedBodyPart.value === "ALL"
    ? undefined
    : {
        BodyPart: selectedBodyPart.value,
        Unit: selectedUnit.value ?? undefined,
      },
);

const formatNumericValue = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return t("trainerMemberDetails.measurements.emptyValue");
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
};

const getMeasurementLabel = (item: MeasurementResponseDto) =>
  item.bodyPart?.displayName ||
  item.bodyPart?.name ||
  t("trainerMemberDetails.measurements.emptyValue");

const getMeasurementUnitLabel = (item: MeasurementResponseDto) =>
  item.unit?.displayName || item.unit?.name || "";

const formatMeasurementValue = (item: MeasurementResponseDto) => {
  const unitLabel = getMeasurementUnitLabel(item);
  const value = formatNumericValue(item.value);
  return unitLabel ? `${value} ${unitLabel}` : value;
};

const formatTrendValue = (value: number | null | undefined, unitLabel: string) => {
  const formattedValue = formatNumericValue(value);
  return unitLabel ? `${formattedValue} ${unitLabel}` : formattedValue;
};

const trendUnitLabel = computed(() => trend.value?.unit?.displayName || trend.value?.unit?.name || "");

const currentValueLabel = computed(() =>
  formatTrendValue(trend.value?.currentValue, trendUnitLabel.value),
);

const changeValueLabel = computed(() =>
  trend.value?.change === undefined
    ? t("trainerMemberDetails.measurements.emptyValue")
    : formatTrendValue(trend.value.change, trendUnitLabel.value),
);

const changePercentageLabel = computed(() =>
  trend.value?.changePercentage === undefined
    ? t("trainerMemberDetails.measurements.emptyValue")
    : `${formatNumericValue(trend.value.changePercentage)}%`,
);

const buildChartPoint = (item: MeasurementResponseDto, index: number) => ({
  key: `${item.bodyPart?.name ?? item.bodyPart?.displayName ?? "measurement"}-${item.createdAt ?? "measurement"}-${index}`,
  label: formatDate(item.createdAt),
  value: item.value ?? 0,
  timestamp: new Date(item.createdAt ?? 0).getTime(),
});

const chartSeries = computed(() => {
  const points = [...historyPoints.value].filter(
    (item) => typeof item.value === "number" && Number.isFinite(item.value),
  );

  if (selectedBodyPart.value !== "ALL") {
    return [
      {
        key: selectedBodyPart.value,
        label: selectedBodyPartLabel.value,
        color: chartPalette[0],
        unitLabel: trendUnitLabel.value,
        values: points
          .sort(
            (left, right) =>
              new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime(),
          )
          .map(buildChartPoint),
      },
    ];
  }

  const groupedSeries = new Map<
    string,
    {
      key: string;
      label: string;
      unitLabel: string;
      values: MeasurementResponseDto[];
    }
  >();

  points.forEach((item) => {
    const bodyPartKey = item.bodyPart?.name || item.bodyPart?.displayName || "Unknown";
    const existingSeries = groupedSeries.get(bodyPartKey);

    if (existingSeries) {
      existingSeries.values.push(item);
      return;
    }

    groupedSeries.set(bodyPartKey, {
      key: bodyPartKey,
      label: item.bodyPart?.displayName || item.bodyPart?.name || t("trainerMemberDetails.measurements.bodyParts.Unknown"),
      unitLabel: item.unit?.displayName || item.unit?.name || "",
      values: [item],
    });
  });

  const optionOrder = new Map(
    measurementTypeOptions.map((option, index) => [option.value, index]),
  );

  return [...groupedSeries.values()]
    .sort((left, right) => {
      const leftOrder = optionOrder.get(left.key as TrainerMeasurementBodyPart) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = optionOrder.get(right.key as TrainerMeasurementBodyPart) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.label.localeCompare(right.label);
    })
    .map((series, index) => ({
      key: series.key,
      label: series.label,
      color: chartPalette[index % chartPalette.length],
      unitLabel: series.unitLabel,
      values: series.values
        .sort(
          (left, right) =>
            new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime(),
        )
        .map(buildChartPoint),
    }));
});

const totalChartPointCount = computed(() =>
  chartSeries.value.reduce((count, series) => count + series.values.length, 0),
);

const chartSubtitle = computed(() => {
  if (selectedBodyPart.value === "ALL") {
    return t("trainerMemberDetails.measurements.chart.allTypesSubtitle");
  }

  const bodyPartLabel = bodyPartOptions.value.find(
    (option) => option.value === selectedBodyPart.value,
  )?.label;

  return t("trainerMemberDetails.measurements.chart.subtitle", {
    bodyPart: bodyPartLabel ?? selectedBodyPart.value,
  });
});

const selectedBodyPartLabel = computed(() => {
  if (selectedBodyPart.value === "ALL") {
    return t("trainerMemberDetails.measurements.filters.allBodyParts");
  }

  return (
    bodyPartOptions.value.find((option) => option.value === selectedBodyPart.value)?.label ??
    selectedBodyPart.value
  );
});

const historyRows = computed(() =>
  [...historyPoints.value]
    .map((item, index) => ({
      key: `${item.createdAt ?? "measurement"}-${index}-${item.value ?? ""}`,
      createdAtMs: new Date(item.createdAt ?? 0).getTime(),
      createdAtLabel: formatDateTime(item.createdAt),
      measurementLabel: getMeasurementLabel(item),
      measurementMeta: getMeasurementUnitLabel(item) || t("trainerMemberDetails.measurements.emptyValue"),
      measurementValue: formatMeasurementValue(item),
      searchValue: [
        formatDateTime(item.createdAt),
        getMeasurementLabel(item),
        getMeasurementUnitLabel(item),
        formatMeasurementValue(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(),
    })),
);

const filteredHistoryRows = computed(() => {
  const searchValue = historySearch.value.trim().toLocaleLowerCase();
  const rows = historyRows.value.filter((row) =>
    searchValue.length === 0 ? true : row.searchValue.includes(searchValue),
  );

  return [...rows].sort((left, right) =>
    historySort.value === "oldest"
      ? left.createdAtMs - right.createdAtMs
      : right.createdAtMs - left.createdAtMs,
  );
});

const historyEmptyMessage = computed(() =>
  historySearch.value.trim().length > 0
    ? t("trainerMemberDetails.measurements.history.empty.search")
    : t("trainerMemberDetails.measurements.empty.title"),
);

const toHistoryRow = (value: unknown) =>
  value as {
    key: string;
    createdAtMs: number;
    createdAtLabel: string;
    measurementLabel: string;
    measurementMeta: string;
    measurementValue: string;
    searchValue: string;
  };

const formatChartValue = (
  value: number,
  series?: { unitLabel?: string },
) => {
  const formatted = formatNumericValue(value);
  return series?.unitLabel ? `${formatted} ${series.unitLabel}` : formatted;
};

const loadMeasurements = async () => {
  if (!props.traineeId) return;

  const currentToken = ++requestToken;
  isLoading.value = true;
  hasError.value = false;

  try {
    const [listResponse, historyResponse, trendResponse] = await Promise.all([
      getApiTrainerTraineesTraineeIdMeasurementsList(props.traineeId, queryParams.value),
      getApiTrainerTraineesTraineeIdMeasurementsHistory(props.traineeId, queryParams.value),
      selectedBodyPart.value === "ALL"
        ? Promise.resolve({ data: {}, status: 404, headers: new Headers() })
        : getApiTrainerTraineesTraineeIdMeasurementsTrend(props.traineeId, queryParams.value),
    ]);

    if (currentToken !== requestToken) return;

    const responses = [listResponse, historyResponse, trendResponse];
    const authResponse = responses.find(
      (response) => response.status === 401 || response.status === 403,
    );

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
      (response) =>
        response.status !== 404 && (response.status < 200 || response.status >= 300),
    );
    if (failedResponse) {
      const message = getApiErrorMessage(failedResponse.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.measurements.feedback.loadFailed");
      hasError.value = true;
      return;
    }

    measurements.value =
      listResponse.status === 200 && isMeasurementsListDto(listResponse.data)
        ? (listResponse.data.measurements ?? [])
        : [];
    historyPoints.value =
      historyResponse.status === 200 && isMeasurementsHistoryDto(historyResponse.data)
        ? (historyResponse.data.measurements ?? [])
        : [];
    trend.value =
      trendResponse.status === 200 && isMeasurementTrendDto(trendResponse.data)
        ? trendResponse.data
        : null;
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
  selectedBodyPart,
  () => {
    selectedUnit.value = getDefaultUnitForBodyPart(selectedBodyPart.value);
  },
);

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

watch([selectedBodyPart, selectedUnit], () => {
  void loadMeasurements();
});
</script>

<style scoped>
.measurements-history-shell :deep(.measurements-history-table thead) {
  border-bottom: 1px solid color-mix(in srgb, var(--lgym-border) 55%, transparent);
}

.measurements-history-shell :deep(.measurements-history-table th) {
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  letter-spacing: 0.14em;
}

.measurements-history-shell :deep(.measurements-history-table td) {
  border-bottom-color: color-mix(in srgb, var(--lgym-border) 45%, transparent);
}

.measurements-history-shell :deep(.measurements-history-table tbody tr) {
  background: transparent;
}

.measurements-history-shell :deep(.measurements-history-table tbody tr:hover) {
  background: color-mix(in srgb, var(--lgym-note-bg) 72%, transparent);
}
</style>
