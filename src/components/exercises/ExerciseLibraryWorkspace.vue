<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4 lg:gap-5">
    <AppDataSection
      :eyebrow="t(`exerciseLibrary.roles.${roleMode}.eyebrow`)"
      :title="t('exerciseLibrary.page.title')"
      :subtitle="t(`exerciseLibrary.roles.${roleMode}.subtitle`)"
      :summary-text="t('exerciseLibrary.page.summary', { totalCount: filteredExercises.length })"
      :pagination-summary="exercisePaginationSummary"
      :previous-label="commonPreviousLabel"
      :next-label="commonNextLabel"
      :disable-previous="exercisePage <= 1 || isLoading"
      :disable-next="exercisePage >= exerciseTotalPages || isLoading"
      @previous="exercisePage = Math.max(1, exercisePage - 1)"
      @next="exercisePage = Math.min(exerciseTotalPages, exercisePage + 1)"
      class="flex-1"
    >
      <template #header-actions>
        <v-btn
          v-if="canCreateExercises"
          color="primary"
          prepend-icon="mdi-plus"
          class="min-h-11 rounded-md px-4"
          @click="openCreateDialog"
        >
          {{ t("exerciseLibrary.actions.add") }}
        </v-btn>
      </template>

      <template #controls>
        <v-text-field
          :model-value="searchQuery"
          :label="t('exerciseLibrary.filters.search')"
          :placeholder="t('exerciseLibrary.filters.searchPlaceholder')"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-magnify"
          class="min-w-[220px] flex-1"
          @update:model-value="searchQuery = String($event ?? '')"
        />

        <v-select
          :model-value="bodyPartFilter"
          :label="t('exerciseLibrary.filters.bodyPart')"
          :items="bodyPartOptions"
          item-title="label"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          class="xl:min-w-[220px]"
          @update:model-value="bodyPartFilter = String($event ?? 'all')"
        />

        <div class="hidden xl:block" />

        <v-select
          :model-value="exercisePageSize"
          :items="exercisePageSizeOptions"
          :label="exercisePageSizeLabel"
          hide-details
          class="xl:min-w-[140px]"
          @update:model-value="updateExercisePageSize"
        />
      </template>

      <template #filters>
        <v-chip
          v-for="option in sourceOptions"
          :key="option.value"
          :color="sourceFilter === option.value ? 'primary' : undefined"
          :variant="sourceFilter === option.value ? 'flat' : 'outlined'"
          class="cursor-pointer rounded-md font-semibold"
          @click="sourceFilter = option.value"
        >
          {{ t(option.labelKey) }}
        </v-chip>
      </template>

      <div v-if="hasLoadError && !isLoading" class="px-6 py-10 text-center">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("exerciseLibrary.feedback.loadFailed") }}
        </p>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="loadExercises">
          {{ t("exerciseLibrary.actions.retry") }}
        </v-btn>
      </div>

      <ExerciseLibraryTable
        v-else
        :items="paginatedExercises"
        :page="exercisePage"
        :items-per-page="exercisePageSize"
        :can-manage-exercise="canManageExercise"
        :can-translate-exercise="canTranslateExercise"
        @edit="openEditDialog"
        @delete="handleDeleteExercise"
        @translate="openTranslationDialog"
      />
    </AppDataSection>

    <ExerciseFormDialog
      v-model="isExerciseDialogOpen"
      :is-editing="isEditingExercise"
      :draft="exerciseDraft"
      :body-part-options="createBodyPartOptions"
      :formula-options="formulaOptions"
      :is-loading-body-parts="isLoadingBodyParts"
      :is-submitting="isSubmittingExercise"
      :show-formula-field="canManageGlobalExercises"
      :can-edit-formula="canManageGlobalExercises"
      @update:draft="exerciseDraft = $event"
      @close="closeExerciseDialog"
      @save="submitExercise"
    />

    <ExerciseTranslationDialog
      v-model="isTranslationDialogOpen"
      :exercise-name="selectedTranslationExercise?.name ?? t('exerciseLibrary.fallback.name')"
      :culture="translationDraft.culture"
      :name="translationDraft.name"
      :locale-options="translationLocaleOptions"
      :is-submitting="isSubmittingTranslation"
      @update:culture="translationDraft.culture = $event"
      @update:name="translationDraft.name = $event"
      @close="closeTranslationDialog"
      @save="submitTranslation"
    />

    <ExerciseDeleteDialog
      v-model="isDeleteDialogOpen"
      :exercise-name="exercisePendingDelete?.name ?? t('exerciseLibrary.fallback.name')"
      :is-deleting="isDeletingExercise"
      @close="closeDeleteDialog"
      @confirm="confirmDeleteExercise"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import {
  getApiEnumsEnumType,
  getApiExerciseGetAllGlobalExercises,
  getApiExerciseIdGetAllUserExercises,
  postApiExerciseAddExercise,
  postApiExerciseIdAddGlobalTranslation,
  postApiExerciseIdAddUserExercise,
  postApiExerciseIdDeleteExercise,
  postApiExerciseUpdateExercise,
} from "../../api/generated/demo";
import type {
  EnumLookupDto,
  ExerciseFormDtoBodyPart,
  ExerciseResponseDto,
  ExerciseTranslationDto,
} from "../../api/model";
import {
  ExerciseEloFormula,
  type ExerciseExtendedFormDto,
} from "../../api/model";
import {
  postApiExerciseAddExerciseWithFormula,
  postApiExerciseIdAddUserExerciseWithFormula,
  postApiExerciseUpdateExerciseWithFormula,
} from "../../api/exerciseManagement";
import { getApiErrorMessage } from "../../api/trainerInvitations";
import {
  clearAuthSession,
  hasGlobalExerciseManagementAccess,
} from "../../composables/useAuthSession";
import { appLocaleOptions } from "../../composables/useAppLocale";
import { getCurrentUser } from "../../composables/useCurrentUser";
import { useToast } from "../../composables/useToast";
import AppDataSection from "../ui/AppDataSection.vue";
import ExerciseDeleteDialog from "./ExerciseDeleteDialog.vue";
import ExerciseFormDialog from "./ExerciseFormDialog.vue";
import ExerciseLibraryTable from "./ExerciseLibraryTable.vue";
import ExerciseTranslationDialog from "./ExerciseTranslationDialog.vue";
import type {
  ExerciseCard,
  ExerciseDraft,
  ExerciseSource,
  RoleMode,
  SelectOption,
  SourceFilter,
  TranslationLocaleOption,
} from "./types";

const BODY_PARTS_ENUM_TYPE = "BodyParts";
const EXERCISE_ELO_FORMULA_ENUM_TYPE = "ExerciseEloFormula";

const props = defineProps<{
  roleMode: RoleMode;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const currentUser = computed(() => getCurrentUser());
const currentUserId = computed(() => currentUser.value?.id?.trim() ?? "");
const canManageGlobalExercises = computed(
  () => props.roleMode === "admin" || hasGlobalExerciseManagementAccess(),
);
const canCreateExercises = computed(() => canManageGlobalExercises.value);

const globalExercises = ref<ExerciseResponseDto[]>([]);
const userExercises = ref<ExerciseResponseDto[]>([]);
const bodyPartLookup = ref<EnumLookupDto[]>([]);
const formulaLookup = ref<EnumLookupDto[]>([]);
const isLoadingBodyParts = ref(false);
const isLoadingFormulaLookup = ref(false);
const isLoading = ref(false);
const hasLoadError = ref(false);
const exercisePage = ref(1);
const exercisePageSize = ref(10);

const searchQuery = ref("");
const bodyPartFilter = ref("all");
const sourceFilter = ref<SourceFilter>("all");

const isExerciseDialogOpen = ref(false);
const isSubmittingExercise = ref(false);
const exerciseDialogMode = ref<"create" | "edit">("create");
const exerciseDraft = ref<ExerciseDraft>({
  id: null,
  source: "global",
  name: "",
  bodyPart: "",
  eloFormula: ExerciseEloFormula.Standard,
  description: "",
  image: "",
});

const isTranslationDialogOpen = ref(false);
const isSubmittingTranslation = ref(false);
const selectedTranslationExercise = ref<ExerciseCard | null>(null);
const translationDraft = ref({
  culture: "",
  name: "",
});

const isDeleteDialogOpen = ref(false);
const isDeletingExercise = ref(false);
const exercisePendingDelete = ref<ExerciseCard | null>(null);

const isEditingExercise = computed(() => exerciseDialogMode.value === "edit");

const translationLocaleOptions = computed<TranslationLocaleOption[]>(() =>
  appLocaleOptions.map((option) => ({
    value: option.value,
    label: `${option.flag} ${t(option.labelKey)} (${option.code})`,
    flag: option.flag,
  })),
);

const formatText = (value: string | null | undefined, fallbackKey: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : t(fallbackKey);
};

const formatBodyPart = (exercise: ExerciseResponseDto) =>
  formatText(
    exercise.bodyPart?.displayName || exercise.bodyPart?.name,
    "exerciseLibrary.fallback.bodyPart",
  );

const redirectToLogin = async () => {
  clearAuthSession();
  toast.error(
    props.roleMode === "admin"
      ? "admin.feedback.unauthorized"
      : "exerciseLibrary.feedback.unauthorized",
  );

  await router.push({
    name: props.roleMode === "admin" ? "login-admin" : "login",
    query: { redirect: route.fullPath },
  });
};

const handleUnauthorized = async (status: number) => {
  if (status !== 401) return false;
  await redirectToLogin();
  return true;
};

const isOptionalEmptyResponse = (status: number) => status === 204 || status === 404;

const jsonRequestOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

const extractEnumValues = (value: unknown): EnumLookupDto[] => {
  if (!value || typeof value !== "object") return [];

  const directValues = (value as { values?: unknown }).values;
  if (Array.isArray(directValues)) {
    return directValues.filter(
      (item): item is EnumLookupDto => !!item && typeof item === "object",
    );
  }

  const nestedData = (value as { data?: unknown }).data;
  if (!nestedData || typeof nestedData !== "object") return [];

  const nestedValues = (nestedData as { values?: unknown }).values;
  return Array.isArray(nestedValues)
    ? nestedValues.filter(
        (item): item is EnumLookupDto => !!item && typeof item === "object",
      )
    : [];
};

const toExerciseCard = (
  exercise: ExerciseResponseDto,
  source: ExerciseSource,
): ExerciseCard | null => {
  const id = exercise._id?.trim();
  if (!id) return null;

  return {
    id,
    ownerUserId: exercise.user?.trim() ?? "",
    name: formatText(exercise.name, "exerciseLibrary.fallback.name"),
    source,
    bodyPart: formatBodyPart(exercise),
    bodyPartValue:
      (exercise.bodyPart?.name || exercise.bodyPart?.displayName || "unknown").trim(),
    description: formatText(
      exercise.description,
      "exerciseLibrary.fallback.description",
    ),
    imageUrl: exercise.image?.trim() ?? "",
  };
};

const allExercises = computed<ExerciseCard[]>(() => {
  const combined = new Map<string, ExerciseCard>();

  for (const exercise of globalExercises.value) {
    const card = toExerciseCard(exercise, "global");
    if (card) combined.set(card.id, card);
  }

  for (const exercise of userExercises.value) {
    const card = toExerciseCard(exercise, "user");
    if (card) combined.set(card.id, card);
  }

  return [...combined.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
});

const bodyPartOptions = computed<SelectOption[]>(() => {
  const entries = new Map<string, string>();

  for (const exercise of allExercises.value) {
    if (!exercise.bodyPartValue || exercise.bodyPartValue === "unknown") continue;
    entries.set(exercise.bodyPartValue, exercise.bodyPart);
  }

  return [
    { value: "all", label: t("exerciseLibrary.filters.allBodyParts") },
    ...[...entries.entries()].map(([value, label]) => ({ value, label })),
  ];
});

const filteredExercises = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  return allExercises.value.filter((exercise) => {
    if (sourceFilter.value !== "all" && exercise.source !== sourceFilter.value) return false;
    if (bodyPartFilter.value !== "all" && exercise.bodyPartValue !== bodyPartFilter.value) return false;
    if (!normalizedQuery) return true;

    return [exercise.name, exercise.description, exercise.bodyPart]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
});

const exercisePageSizeOptions = [10, 20, 50];

const exerciseTotalPages = computed(() =>
  Math.max(Math.ceil(filteredExercises.value.length / exercisePageSize.value) || 1, 1),
);

const paginatedExercises = computed(() => {
  const currentPage = Math.min(exercisePage.value, exerciseTotalPages.value);
  const startIndex = (currentPage - 1) * exercisePageSize.value;

  return filteredExercises.value.slice(startIndex, startIndex + exercisePageSize.value);
});

const commonPreviousLabel = computed(() =>
  props.roleMode === "admin"
    ? t("admin.actions.previous")
    : t("trainerMembers.actions.previous"),
);

const commonNextLabel = computed(() =>
  props.roleMode === "admin"
    ? t("admin.actions.next")
    : t("trainerMembers.actions.next"),
);

const exercisePageSizeLabel = computed(() =>
  props.roleMode === "admin"
    ? t("admin.filters.pageSize")
    : t("trainerMembers.list.filters.pageSize"),
);

const exercisePaginationSummary = computed(() => {
  const totalCount = filteredExercises.value.length;

  return t("exerciseLibrary.pagination.summary", {
    page: exercisePage.value,
    totalPages: exerciseTotalPages.value,
    totalCount,
  });
});

const sourceOptions = [
  { value: "all", labelKey: "exerciseLibrary.filters.all" },
  { value: "global", labelKey: "exerciseLibrary.filters.global" },
  { value: "user", labelKey: "exerciseLibrary.filters.user" },
] as const;

const normalizeExercisePage = () => {
  exercisePage.value = Math.min(exercisePage.value, exerciseTotalPages.value);
};

const updateExercisePageSize = (value: unknown) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) return;

  exercisePageSize.value = parsedValue;
  exercisePage.value = 1;
};

watch([filteredExercises, exerciseTotalPages], () => {
  normalizeExercisePage();
});

const createBodyPartOptions = computed<SelectOption[]>(() =>
  bodyPartLookup.value
    .map((item) => ({
      value: item.name?.trim() ?? "",
      label:
        item.displayName?.trim() ||
        item.name?.trim() ||
        t("exerciseLibrary.fallback.bodyPart"),
    }))
    .filter((item) => item.value.length > 0),
);

const formulaOptions = computed<SelectOption[]>(() =>
  formulaLookup.value
    .map((item) => ({
      value: item.name?.trim() ?? "",
      label:
        item.displayName?.trim() ||
        item.name?.trim() ||
        t("exerciseLibrary.fallback.formula"),
    }))
    .filter((item) => item.value.length > 0),
);

const canManageExercise = (exercise: ExerciseCard) =>
  canManageGlobalExercises.value ||
  (exercise.source === "user" &&
    !!currentUserId.value &&
    exercise.ownerUserId === currentUserId.value);

const canTranslateExercise = (exercise: ExerciseCard) =>
  canManageGlobalExercises.value && exercise.source === "global";

const resetExerciseDraft = () => {
  exerciseDraft.value = {
    id: null,
    source: "global",
    name: "",
    bodyPart: "",
    eloFormula: ExerciseEloFormula.Standard,
    description: "",
    image: "",
  };
};

const resetTranslationDraft = () => {
  translationDraft.value = {
    culture: "",
    name: "",
  };
};

const closeExerciseDialog = () => {
  isExerciseDialogOpen.value = false;
  resetExerciseDraft();
};

const closeTranslationDialog = () => {
  isTranslationDialogOpen.value = false;
  selectedTranslationExercise.value = null;
  resetTranslationDraft();
};

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false;
  exercisePendingDelete.value = null;
};

const loadBodyParts = async () => {
  if (bodyPartLookup.value.length > 0) return true;

  isLoadingBodyParts.value = true;
  try {
    const enumResponse = await getApiEnumsEnumType(BODY_PARTS_ENUM_TYPE);

    if (await handleUnauthorized(enumResponse.status)) return false;

    if (enumResponse.status !== 200) {
      const message = getApiErrorMessage(enumResponse.data);
      if (message) toast.errorMessage(message);
      else toast.error("exerciseLibrary.feedback.loadFailed");
      return false;
    }

    bodyPartLookup.value = extractEnumValues(enumResponse.data);
    return true;
  } catch (error: unknown) {
    console.error(error);
    toast.error("exerciseLibrary.feedback.loadFailed");
    return false;
  } finally {
    isLoadingBodyParts.value = false;
  }
};

const loadFormulaLookup = async () => {
  if (formulaLookup.value.length > 0) return true;

  isLoadingFormulaLookup.value = true;
  try {
    const enumResponse = await getApiEnumsEnumType(EXERCISE_ELO_FORMULA_ENUM_TYPE);

    if (await handleUnauthorized(enumResponse.status)) return false;

    if (enumResponse.status !== 200) {
      const message = getApiErrorMessage(enumResponse.data);
      if (message) toast.errorMessage(message);
      else toast.error("exerciseLibrary.feedback.loadFailed");
      return false;
    }

    formulaLookup.value = extractEnumValues(enumResponse.data);
    return true;
  } catch (error: unknown) {
    console.error(error);
    toast.error("exerciseLibrary.feedback.loadFailed");
    return false;
  } finally {
    isLoadingFormulaLookup.value = false;
  }
};

const openCreateDialog = async () => {
  const [bodyPartsLoaded, formulasLoaded] = await Promise.all([
    loadBodyParts(),
    canManageGlobalExercises.value ? loadFormulaLookup() : Promise.resolve(true),
  ]);
  if (!bodyPartsLoaded || !formulasLoaded) return;

  exerciseDialogMode.value = "create";
  resetExerciseDraft();
  isExerciseDialogOpen.value = true;
};

const openEditDialog = async (exercise: ExerciseCard) => {
  const [bodyPartsLoaded, formulasLoaded] = await Promise.all([
    loadBodyParts(),
    canManageGlobalExercises.value ? loadFormulaLookup() : Promise.resolve(true),
  ]);
  if (!bodyPartsLoaded || !formulasLoaded) return;

  exerciseDialogMode.value = "edit";
  exerciseDraft.value = {
    id: exercise.id,
    source: exercise.source,
    name: exercise.name,
    bodyPart: exercise.bodyPartValue === "unknown" ? "" : exercise.bodyPartValue,
    eloFormula: ExerciseEloFormula.Standard,
    description:
      exercise.description === t("exerciseLibrary.fallback.description")
        ? ""
        : exercise.description,
    image: exercise.imageUrl,
  };
  isExerciseDialogOpen.value = true;
};

const openTranslationDialog = (exercise: ExerciseCard) => {
  selectedTranslationExercise.value = exercise;
  resetTranslationDraft();
  isTranslationDialogOpen.value = true;
};

const handleDeleteExercise = (exercise: ExerciseCard) => {
  exercisePendingDelete.value = exercise;
  isDeleteDialogOpen.value = true;
};

const loadExercises = async () => {
  isLoading.value = true;
  hasLoadError.value = false;

  try {
    const globalResponse = await getApiExerciseGetAllGlobalExercises();

    if (await handleUnauthorized(globalResponse.status)) return;

    if (globalResponse.status !== 200) {
      hasLoadError.value = true;
      const message = getApiErrorMessage(globalResponse.data);
      if (message) toast.errorMessage(message);
      else toast.error("exerciseLibrary.feedback.loadFailed");
      return;
    }

    globalExercises.value = [...(globalResponse.data ?? [])];

    if (!currentUserId.value) {
      userExercises.value = [];
      return;
    }

    const userResponse = await getApiExerciseIdGetAllUserExercises(currentUserId.value);

    if (await handleUnauthorized(userResponse.status)) return;

    if (userResponse.status !== 200 && !isOptionalEmptyResponse(userResponse.status)) {
      hasLoadError.value = true;
      const message = getApiErrorMessage(userResponse.data);
      if (message) toast.errorMessage(message);
      else toast.error("exerciseLibrary.feedback.loadFailed");
      return;
    }

    userExercises.value = userResponse.status === 200 ? [...(userResponse.data ?? [])] : [];
  } catch (error: unknown) {
    console.error(error);
    hasLoadError.value = true;
    toast.error("exerciseLibrary.feedback.loadFailed");
  } finally {
    isLoading.value = false;
  }
};

const submitExercise = async () => {
  const trimmedName = exerciseDraft.value.name.trim();
  if (!trimmedName) {
    toast.error("exerciseLibrary.feedback.nameRequired");
    return;
  }

  const bodyPart = exerciseDraft.value.bodyPart.trim();
  if (!bodyPart) {
    toast.error("exerciseLibrary.feedback.bodyPartRequired");
    return;
  }

  if (exerciseDraft.value.source === "user" && !currentUserId.value) {
    toast.error("exerciseLibrary.feedback.userTargetUnavailable");
    return;
  }

  isSubmittingExercise.value = true;

  try {
    const payload: ExerciseExtendedFormDto = {
      _id: exerciseDraft.value.id,
      name: trimmedName,
      bodyPart: bodyPart as ExerciseFormDtoBodyPart,
      eloFormula: exerciseDraft.value.eloFormula,
      description: exerciseDraft.value.description.trim() || null,
      image: exerciseDraft.value.image.trim() || null,
      user: exerciseDraft.value.source === "user" ? currentUserId.value : null,
    };

    const useFormulaEndpoints = canManageGlobalExercises.value;

    const response =
      exerciseDialogMode.value === "create"
        ? exerciseDraft.value.source === "global"
          ? useFormulaEndpoints
            ? await postApiExerciseAddExerciseWithFormula(payload, jsonRequestOptions)
            : await postApiExerciseAddExercise(payload, jsonRequestOptions)
          : useFormulaEndpoints
            ? await postApiExerciseIdAddUserExerciseWithFormula(
                currentUserId.value,
                payload,
                jsonRequestOptions,
              )
            : await postApiExerciseIdAddUserExercise(
                currentUserId.value,
                payload,
                jsonRequestOptions,
              )
        : useFormulaEndpoints
          ? await postApiExerciseUpdateExerciseWithFormula(payload, jsonRequestOptions)
          : await postApiExerciseUpdateExercise(payload, jsonRequestOptions);

    if (await handleUnauthorized(response.status)) return;

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else {
        toast.error(
          exerciseDialogMode.value === "create"
            ? "exerciseLibrary.feedback.saveFailed"
            : "exerciseLibrary.feedback.updateFailed",
        );
      }
      return;
    }

    toast.success(
      exerciseDialogMode.value === "create"
        ? "exerciseLibrary.feedback.saveSuccess"
        : "exerciseLibrary.feedback.updateSuccess",
    );
    closeExerciseDialog();
    await loadExercises();
  } catch (error: unknown) {
    console.error(error);
    toast.error(
      exerciseDialogMode.value === "create"
        ? "exerciseLibrary.feedback.saveFailed"
        : "exerciseLibrary.feedback.updateFailed",
    );
  } finally {
    isSubmittingExercise.value = false;
  }
};

const confirmDeleteExercise = async () => {
  const exercise = exercisePendingDelete.value;
  if (!exercise) return;

  const requestUserId =
    exercise.source === "user"
      ? exercise.ownerUserId || currentUserId.value
      : currentUserId.value;

  if (!requestUserId) {
    toast.error("exerciseLibrary.feedback.deleteContextMissing");
    return;
  }

  isDeletingExercise.value = true;

  try {
    const deletePayload: Record<string, string> = {
      exerciseId: exercise.id,
      id: exercise.id,
    };

    const response = await postApiExerciseIdDeleteExercise(
      requestUserId,
      deletePayload,
      jsonRequestOptions,
    );

    if (await handleUnauthorized(response.status)) return;

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("exerciseLibrary.feedback.deleteFailed");
      return;
    }

    toast.success("exerciseLibrary.feedback.deleteSuccess");
    closeDeleteDialog();
    await loadExercises();
  } catch (error: unknown) {
    console.error(error);
    toast.error("exerciseLibrary.feedback.deleteFailed");
  } finally {
    isDeletingExercise.value = false;
  }
};

const submitTranslation = async () => {
  const exercise = selectedTranslationExercise.value;
  if (!exercise) return;

  const requestUserId = currentUserId.value;
  if (!requestUserId) {
    toast.error("exerciseLibrary.feedback.translationFailed");
    return;
  }

  const culture = translationDraft.value.culture.trim();
  const name = translationDraft.value.name.trim();

  if (!culture) {
    toast.error("exerciseLibrary.feedback.translationCultureRequired");
    return;
  }

  if (!name) {
    toast.error("exerciseLibrary.feedback.translationNameRequired");
    return;
  }

  isSubmittingTranslation.value = true;

  try {
    const payload: ExerciseTranslationDto = {
      exerciseId: exercise.id,
      culture,
      name,
    };

    const response = await postApiExerciseIdAddGlobalTranslation(
      requestUserId,
      payload,
      jsonRequestOptions,
    );

    if (await handleUnauthorized(response.status)) return;

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("exerciseLibrary.feedback.translationFailed");
      return;
    }

    toast.success("exerciseLibrary.feedback.translationSuccess");
    closeTranslationDialog();
  } catch (error: unknown) {
    console.error(error);
    toast.error("exerciseLibrary.feedback.translationFailed");
  } finally {
    isSubmittingTranslation.value = false;
  }
};

onMounted(() => {
  void loadExercises();
});
</script>
