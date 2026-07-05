<template>
  <div class="min-w-0 overflow-x-auto px-2 py-2 sm:px-4 lg:px-6">
    <AppDataTable
      :headers="headers"
      :items="items"
      item-value="id"
      :items-per-page="itemsPerPage"
      :page="page"
      hide-default-footer
      density="comfortable"
      hover
    >
      <template #item.name="{ item }">
        <div class="min-w-[200px] py-3">
          <p class="font-semibold text-[var(--lgym-text)]">{{ toExercise(item).name }}</p>
        </div>
      </template>

      <template #item.bodyPart="{ item }">
        <div class="min-w-[140px] py-3">
          <v-chip size="small" color="primary" variant="outlined">
            {{ toExercise(item).bodyPart }}
          </v-chip>
        </div>
      </template>

      <template #item.source="{ item }">
        <div class="min-w-[120px] py-3">
          <v-chip size="small" :color="toExercise(item).source === 'global' ? 'success' : 'warning'" variant="outlined">
            {{ t(`exerciseLibrary.source.${toExercise(item).source}`) }}
          </v-chip>
        </div>
      </template>

      <template #item.description="{ item }">
        <div class="min-w-[260px] max-w-[420px] py-3 text-sm text-[var(--lgym-text-muted)]">
          {{ toExercise(item).description }}
        </div>
      </template>

      <template #item.image="{ item }">
        <div class="min-w-[140px] py-3 text-sm">
          <a
            v-if="toExercise(item).imageUrl"
            :href="toExercise(item).imageUrl"
            target="_blank"
            rel="noreferrer"
            class="font-medium text-[var(--lgym-primary)]"
          >
            {{ t("exerciseLibrary.actions.openImage") }}
          </a>
          <span v-else class="text-[var(--lgym-text-soft)]">
            {{ t("exerciseLibrary.meta.noImage") }}
          </span>
        </div>
      </template>

        <template #item.actions="{ item }">
          <div class="flex min-w-[170px] flex-wrap justify-end gap-2 py-2">
            <v-btn
              v-if="canManageExercise(toExercise(item))"
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              @click="$emit('edit', toExercise(item))"
            >
              {{ t("exerciseLibrary.actions.edit") }}
            </v-btn>
            <v-btn
              v-if="canManageExercise(toExercise(item))"
              variant="outlined"
              color="error"
              class="min-h-10 rounded-md px-4"
              @click="$emit('delete', toExercise(item))"
            >
              {{ t("exerciseLibrary.actions.delete") }}
            </v-btn>
            <v-btn
              v-if="canTranslateExercise(toExercise(item))"
              variant="outlined"
              color="secondary"
              class="min-h-10 rounded-md px-4"
              @click="$emit('translate', toExercise(item))"
            >
              {{ t("exerciseLibrary.actions.addTranslation") }}
            </v-btn>
          </div>
        </template>

      <template #no-data>
        <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("exerciseLibrary.empty") }}
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import AppDataTable from "../ui/AppDataTable.vue";
import type { ExerciseCard } from "./types";

defineProps<{
  items: ExerciseCard[];
  page: number;
  itemsPerPage: number;
  canManageExercise: (exercise: ExerciseCard) => boolean;
  canTranslateExercise: (exercise: ExerciseCard) => boolean;
}>();

defineEmits<{
  edit: [exercise: ExerciseCard];
  delete: [exercise: ExerciseCard];
  translate: [exercise: ExerciseCard];
}>();

const { t } = useI18n();

const toExercise = (item: unknown) => item as ExerciseCard;

const headers = computed(() => [
  { title: t("exerciseLibrary.columns.name"), key: "name", sortable: true },
  { title: t("exerciseLibrary.columns.bodyPart"), key: "bodyPart", sortable: true },
  { title: t("exerciseLibrary.columns.source"), key: "source", sortable: true },
  { title: t("exerciseLibrary.columns.description"), key: "description", sortable: false },
  { title: t("exerciseLibrary.columns.image"), key: "image", sortable: false },
  { title: t("exerciseLibrary.columns.actions"), key: "actions", sortable: false, align: "end" as const },
]);
</script>
