<template>
  <div class="app-data-table">
    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <div v-if="showMobileSlot" class="app-data-table__mobile">
      <slot name="mobile" />
    </div>

    <v-data-table-server
      v-else-if="server"
      ref="tableInstanceRef"
      :class="tableClassName"
      :headers="headers"
      :items="items"
      :items-length="itemsLength"
      :items-per-page="itemsPerPage"
      :page="page"
      :loading="loading"
      :item-value="itemValue"
      :hide-default-footer="hideDefaultFooter"
      :hover="hover"
      :row-props="rowProps"
      :density="density"
      v-bind="attrs"
      @click:row="onClickRow"
      @update:page="onUpdatePage"
      @update:items-per-page="onUpdateItemsPerPage"
    >
      <template
        v-for="slotName in forwardedSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="toSlotBindings(slotProps)" />
      </template>
    </v-data-table-server>

    <v-data-table
      v-else
      ref="tableInstanceRef"
      :class="tableClassName"
      :headers="headers"
      :items="items"
      :items-per-page="itemsPerPage"
      :page="page"
      :loading="loading"
      :item-value="itemValue"
      :hide-default-footer="hideDefaultFooter"
      :hover="hover"
      :row-props="rowProps"
      :density="density"
      v-bind="attrs"
      @click:row="onClickRow"
      @update:page="onUpdatePage"
      @update:items-per-page="onUpdateItemsPerPage"
    >
      <template
        v-for="slotName in forwardedSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="toSlotBindings(slotProps)" />
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, type ComponentPublicInstance } from "vue";
import { useDisplay } from "vuetify";

defineOptions({
  inheritAttrs: false,
});

type TableHeader = {
  title: string;
  key: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

const props = withDefaults(
  defineProps<{
    headers: TableHeader[];
    items: unknown[];
    itemsLength?: number;
    itemsPerPage?: number;
    page?: number;
    loading?: boolean;
    itemValue?: string;
    server?: boolean;
    hideDefaultFooter?: boolean;
    hover?: boolean;
    rowClickable?: boolean;
    density?: "default" | "comfortable" | "compact";
  }>(),
  {
    itemsLength: 0,
    itemsPerPage: 10,
    page: 1,
    loading: false,
    itemValue: "id",
    server: false,
    hideDefaultFooter: false,
    hover: true,
    rowClickable: false,
    density: "comfortable",
  },
);

const emit = defineEmits<{
  "update:page": [value: number];
  "update:items-per-page": [value: number];
  "row-click": [item: unknown];
}>();

const attrs = useAttrs();
const slots = useSlots();
const { lgAndUp } = useDisplay();
const tableInstanceRef = ref<ComponentPublicInstance | HTMLElement | null>(null);

const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter((slotName) => slotName !== "default" && slotName !== "mobile"),
);

const showMobileSlot = computed(() => !lgAndUp.value && !!slots.mobile);

const tableClassName = computed(() => [
  "app-data-table__table",
  { "app-data-table__table--hover": props.hover },
]);

const rowProps = computed(() => {
  if (!props.rowClickable) {
    return undefined;
  }

  return {
    class: "app-data-table__row--clickable",
  };
});

const toSlotBindings = (slotProps: unknown) =>
  slotProps && typeof slotProps === "object"
    ? (slotProps as Record<string, unknown>)
    : {};

const onUpdatePage = (value: number) => {
  emit("update:page", value);
};

const onUpdateItemsPerPage = (value: number) => {
  emit("update:items-per-page", value);
};

const onClickRow = (_event: Event, payload: unknown) => {
  if (!props.rowClickable || !payload || typeof payload !== "object") {
    return;
  }

  const rowPayload = payload as { item?: unknown };
  emit("row-click", rowPayload.item ?? payload);
};

const getTableElement = () => {
  const target = tableInstanceRef.value;

  if (target instanceof HTMLElement) {
    return target;
  }

  return target?.$el instanceof HTMLElement ? target.$el : null;
};

defineExpose({
  getTableElement,
});
</script>

<style scoped>
.app-data-table {
  min-height: 0;
}

.app-data-table__table :deep(.v-table__wrapper) {
  overflow-x: auto;
  overflow-y: hidden;
  padding-right: 0.25rem;
}

.app-data-table__table :deep(table) {
  min-width: 100%;
}

.app-data-table__table :deep(thead) {
  border-bottom: 1px solid var(--lgym-border);
  background:
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.96), rgba(var(--v-theme-surface), 0.9)),
    var(--lgym-table-head-bg);
  backdrop-filter: blur(10px);
}

.app-data-table__table :deep(th) {
  padding: 0.95rem 1.25rem;
  color: var(--lgym-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-align: left;
  text-transform: uppercase;
  box-shadow: none;
  white-space: nowrap;
}

.app-data-table__table :deep(th:last-child) {
  padding-right: 1.25rem;
}

.app-data-table__table :deep(td) {
  min-width: 0;
  padding: 0;
  border-bottom: 1px solid var(--lgym-border);
  vertical-align: top;
}

.app-data-table__table :deep(tbody tr) {
  transition:
    background-color 0.18s ease;
}

.app-data-table__table--hover :deep(tbody tr:hover) {
  background: var(--lgym-table-row-hover);
}

.app-data-table__table :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.app-data-table__table :deep(.app-data-table__row--clickable) {
  cursor: pointer;
}
</style>
