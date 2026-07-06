<template>
  <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-3 py-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
          {{ title }}
        </h3>
        <p class="mt-1 text-sm text-[var(--lgym-text-muted)]">
          {{ subtitle }}
        </p>
      </div>
      <span class="rounded-full bg-[var(--lgym-note-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lgym-primary)]">
        {{ pointCountLabel }}
      </span>
    </div>

    <div v-if="hasChartData" class="mt-6">
      <div
        v-if="visibleSeries.length > 1"
        class="mb-4 flex flex-wrap gap-2"
      >
        <div
          v-for="series in visibleSeries"
          :key="series.key"
          class="inline-flex items-center gap-2 rounded-full bg-[var(--lgym-note-bg)] px-3 py-1 text-xs font-semibold text-[var(--lgym-text)]"
        >
          <span
            class="h-2.5 w-2.5 rounded-full"
            :style="{ backgroundColor: series.color }"
          />
          <span>{{ series.label }}</span>
        </div>
      </div>

      <div ref="chartContainerRef" class="relative overflow-visible">
        <div
          v-if="hoveredPoint"
          class="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-3 py-2 text-xs shadow-[var(--lgym-shadow-surface)]"
          :style="tooltipStyle"
        >
          <p class="font-semibold text-[var(--lgym-text)]">
            {{ hoveredPoint.label }}
          </p>
          <p class="mt-1 font-semibold" :style="{ color: hoveredPoint.series.color }">
            {{ hoveredPoint.series.label }}
          </p>
          <p class="mt-1 text-[var(--lgym-text-muted)]">
            {{ hoverValueLabel }}
          </p>
        </div>

        <svg viewBox="0 0 100 56" class="h-56 w-full overflow-visible">
          <line
            v-for="tick in gridTicks"
            :key="tick"
            x1="0"
            :y1="tick"
            x2="100"
            :y2="tick"
            stroke="rgba(148, 163, 184, 0.22)"
            stroke-width="0.6"
          />
          <polyline
            v-for="series in renderedSeries"
            :key="series.key"
            :points="series.polylinePoints"
            fill="none"
            :stroke="series.color"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="point in allRenderedPoints"
            :key="point.key"
            :cx="point.x"
            :cy="point.y"
            r="2.1"
            :fill="point.series.color"
            class="cursor-pointer"
            @mouseenter="onPointHover(point, $event)"
            @mousemove="onPointHover(point, $event)"
            @mouseleave="hoveredPoint = null"
          />
        
          <text
            x="0"
            y="4"
            font-size="3.2"
            fill="var(--lgym-text-soft)"
          >
            {{ maxValueLabel }}
          </text>
          <text
            x="0"
            y="46"
            font-size="3.2"
            fill="var(--lgym-text-soft)"
          >
            {{ minValueLabel }}
          </text>
        </svg>
      </div>

      <div class="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--lgym-text-soft)]">
        <span>{{ firstPointLabel }}</span>
        <span class="text-center">{{ middlePointLabel }}</span>
        <span class="text-right">{{ lastPointLabel }}</span>
      </div>

      <div class="mt-2 grid gap-3 sm:grid-cols-3">
        <div class="rounded-md bg-[var(--lgym-note-bg)] px-4 py-3">
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--lgym-text-soft)]">
            {{ minLabel }}
          </p>
          <p class="mt-1 text-sm font-semibold text-[var(--lgym-text)]">
            {{ minValueLabel }}
          </p>
        </div>
        <div class="rounded-md bg-[var(--lgym-note-bg)] px-4 py-3">
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--lgym-text-soft)]">
            {{ maxLabel }}
          </p>
          <p class="mt-1 text-sm font-semibold text-[var(--lgym-text)]">
            {{ maxValueLabel }}
          </p>
        </div>
        <div class="rounded-md bg-[var(--lgym-note-bg)] px-4 py-3">
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--lgym-text-soft)]">
            {{ latestLabel }}
          </p>
          <p class="mt-1 text-sm font-semibold text-[var(--lgym-text)]">
            {{ latestValueLabel }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="mt-6 rounded-md border border-dashed border-[var(--lgym-border)] px-4 py-8 text-center text-sm text-[var(--lgym-text-muted)]"
    >
      {{ emptyMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type ChartPoint = {
  key: string;
  label: string;
  value: number;
  timestamp: number;
};

type ChartSeries = {
  key: string;
  label: string;
  color: string;
  unitLabel?: string;
  values: ChartPoint[];
};

type RenderedChartPoint = ChartPoint & {
  x: number;
  y: number;
  series: ChartSeries;
};

type RenderedChartSeries = ChartSeries & {
  points: RenderedChartPoint[];
  polylinePoints: string;
};

type HoveredChartPoint = RenderedChartPoint & {
  tooltipLeft: number;
  tooltipTop: number;
};

const props = defineProps<{
  title: string;
  subtitle: string;
  minLabel: string;
  maxLabel: string;
  latestLabel: string;
  emptyMessage: string;
  pointCountLabel: string;
  series: ChartSeries[];
  formatValue: (value: number, series?: ChartSeries) => string;
}>();

const gridTicks = [6, 18, 30, 42];
const chartContainerRef = ref<HTMLElement | null>(null);
const hoveredPoint = ref<HoveredChartPoint | null>(null);

const visibleSeries = computed(() =>
  props.series
    .map((series) => ({
      ...series,
      values: series.values.filter((item) => Number.isFinite(item.value)),
    }))
    .filter((series) => series.values.length > 0),
);

const allSafeValues = computed(() => visibleSeries.value.flatMap((series) => series.values));

const minValue = computed(() =>
  allSafeValues.value.length > 0
    ? Math.min(...allSafeValues.value.map((item) => item.value))
    : null,
);

const maxValue = computed(() =>
  allSafeValues.value.length > 0
    ? Math.max(...allSafeValues.value.map((item) => item.value))
    : null,
);

const latestValue = computed(() => {
  if (allSafeValues.value.length === 0) return null;

  const sortedPoints = [...allSafeValues.value].sort((left, right) => left.timestamp - right.timestamp);
  const latestPoint = sortedPoints[sortedPoints.length - 1];
  return latestPoint?.value ?? null;
});

const timestampBounds = computed(() => {
  if (allSafeValues.value.length === 0) {
    return null;
  }

  const timestamps = allSafeValues.value.map((item) => item.timestamp);
  return {
    min: Math.min(...timestamps),
    max: Math.max(...timestamps),
  };
});

const renderedSeries = computed(() => {
  if (visibleSeries.value.length === 0 || !timestampBounds.value) {
    return [] as RenderedChartSeries[];
  }

  const min = minValue.value ?? 0;
  const max = maxValue.value ?? 0;
  const range = max - min;
  const timestampRange = timestampBounds.value.max - timestampBounds.value.min;

  return visibleSeries.value.map((series) => {
    const points = [...series.values]
      .sort((left, right) => left.timestamp - right.timestamp)
      .map((item) => {
        const x = timestampRange === 0
          ? 50
          : ((item.timestamp - timestampBounds.value!.min) / timestampRange) * 100;
        const normalized = range === 0 ? 0.5 : (item.value - min) / range;
        const y = 42 - normalized * 30;

        return {
          ...item,
          x,
          y,
          series,
        };
      });

    return {
      ...series,
      points,
      polylinePoints: points.map((point) => `${point.x},${point.y}`).join(" "),
    };
  });
});

const allRenderedPoints = computed(() => renderedSeries.value.flatMap((series) => series.points));

const hasChartData = computed(() => allRenderedPoints.value.length > 0);

const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return {};

  return {
    left: `${hoveredPoint.value.tooltipLeft}px`,
    top: `${hoveredPoint.value.tooltipTop}px`,
  };
});

const onPointHover = (point: RenderedChartPoint, event: MouseEvent) => {
  const chartContainer = chartContainerRef.value;
  if (!chartContainer) {
    hoveredPoint.value = null;
    return;
  }

  const containerRect = chartContainer.getBoundingClientRect();
  const padding = 88;
  const tooltipLeft = Math.min(
    Math.max(event.clientX - containerRect.left, padding),
    containerRect.width - padding,
  );
  const tooltipTop = Math.min(
    Math.max(event.clientY - containerRect.top, padding),
    containerRect.height - padding,
  );

  hoveredPoint.value = {
    ...point,
    tooltipLeft,
    tooltipTop,
  };
};

const hoverValueLabel = computed(() =>
  hoveredPoint.value ? props.formatValue(hoveredPoint.value.value, hoveredPoint.value.series) : "",
);

const timelineLabels = computed(() => {
  const labels = [...allRenderedPoints.value]
    .sort((left, right) => left.timestamp - right.timestamp)
    .map((point) => point.label);

  return [...new Set(labels)];
});

const firstPointLabel = computed(() => timelineLabels.value[0] ?? "—");
const middlePointLabel = computed(() => {
  if (timelineLabels.value.length === 0) return "—";
  const index = Math.floor((timelineLabels.value.length - 1) / 2);
  return timelineLabels.value[index] ?? "—";
});
const lastPointLabel = computed(() => timelineLabels.value[timelineLabels.value.length - 1] ?? "—");

const minValueLabel = computed(() =>
  minValue.value === null ? "—" : props.formatValue(minValue.value),
);
const maxValueLabel = computed(() =>
  maxValue.value === null ? "—" : props.formatValue(maxValue.value),
);
const latestValueLabel = computed(() =>
  latestValue.value === null ? "—" : props.formatValue(latestValue.value),
);
</script>
