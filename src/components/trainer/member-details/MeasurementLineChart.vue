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

    <div v-if="chartPoints.length > 1" class="mt-6">
      <div ref="chartContainerRef" class="relative overflow-visible">
        <div
          v-if="hoveredPoint"
          class="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-3 py-2 text-xs shadow-[var(--lgym-shadow-surface)]"
          :style="tooltipStyle"
        >
          <p class="font-semibold text-[var(--lgym-text)]">
            {{ hoveredPoint.label }}
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
          :points="polylinePoints"
          fill="none"
          stroke="var(--lgym-primary)"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
          <circle
            v-for="point in chartPoints"
            :key="point.key"
            :cx="point.x"
            :cy="point.y"
            r="2.1"
            fill="var(--lgym-primary)"
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
};

type RenderedChartPoint = ChartPoint & {
  x: number;
  y: number;
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
  values: ChartPoint[];
  formatValue: (value: number) => string;
}>();

const gridTicks = [6, 18, 30, 42];
const chartContainerRef = ref<HTMLElement | null>(null);
const hoveredPoint = ref<HoveredChartPoint | null>(null);

const safeValues = computed(() => props.values.filter((item) => Number.isFinite(item.value)));

const minValue = computed(() =>
  safeValues.value.length > 0
    ? Math.min(...safeValues.value.map((item) => item.value))
    : null,
);

const maxValue = computed(() =>
  safeValues.value.length > 0
    ? Math.max(...safeValues.value.map((item) => item.value))
    : null,
);

const latestValue = computed(() => {
  if (safeValues.value.length === 0) return null;
  return safeValues.value[safeValues.value.length - 1]?.value ?? null;
});

const chartPoints = computed(() => {
  if (safeValues.value.length === 0) return [] as RenderedChartPoint[];

  const min = minValue.value ?? 0;
  const max = maxValue.value ?? 0;
  const range = max - min;

  return safeValues.value.map((item, index) => {
    const x = safeValues.value.length === 1 ? 50 : (index / (safeValues.value.length - 1)) * 100;
    const normalized = range === 0 ? 0.5 : (item.value - min) / range;
    const y = 42 - normalized * 30;

    return {
      ...item,
      x,
      y,
    };
  });
});

const polylinePoints = computed(() =>
  chartPoints.value.map((point) => `${point.x},${point.y}`).join(" "),
);

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
  hoveredPoint.value ? props.formatValue(hoveredPoint.value.value) : "",
);

const firstPointLabel = computed(() => chartPoints.value[0]?.label ?? "—");
const middlePointLabel = computed(() => {
  if (chartPoints.value.length === 0) return "—";
  const index = Math.floor((chartPoints.value.length - 1) / 2);
  return chartPoints.value[index]?.label ?? "—";
});
const lastPointLabel = computed(() => chartPoints.value[chartPoints.value.length - 1]?.label ?? "—");

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
