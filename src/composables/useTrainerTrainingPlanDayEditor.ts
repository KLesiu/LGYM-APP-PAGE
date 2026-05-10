import { computed, ref } from "vue";

import {
  getApiExerciseGetAllGlobalExercises,
  getApiExerciseIdGetAllExercises,
  getApiIdGetPlansList,
  getApiPlanDayIdGetPlanDay,
  getApiPlanDayIdGetPlanDaysInfo,
  postApiPlanDayIdCreatePlanDay,
  postApiPlanDayUpdatePlanDay,
} from "../api/generated/demo";
import type {
  ExerciseResponseDto,
  PlanDayFormDto,
  PlanDayVmDto,
  PlanFormDto,
} from "../api/model";
import { getApiErrorMessage } from "../api/trainerInvitations";
import { getCurrentUser } from "./useCurrentUser";
import { useToast } from "./useToast";

const createEmptyDraft = (): PlanDayFormDto => ({
  _id: null,
  name: "",
  exercises: [],
});

const mapPlanDayToDraft = (planDay: PlanDayVmDto | null | undefined): PlanDayFormDto => ({
  _id: planDay?._id ?? null,
  name: planDay?.name ?? "",
  exercises:
    planDay?.exercises?.map((exercise) => ({
      exercise: exercise.exercise?._id ?? null,
      reps: exercise.reps ?? "Max",
      series: exercise.series ?? 1,
    })) ?? [],
});

const normalizeDraft = (draft: PlanDayFormDto): PlanDayFormDto => ({
  _id: draft._id?.trim() || null,
  name: draft.name?.trim() || null,
  exercises: (draft.exercises ?? [])
    .map((exercise) => ({
      exercise: exercise.exercise?.trim() || null,
      reps: exercise.reps?.trim() || null,
      series:
        typeof exercise.series === "number" && Number.isFinite(exercise.series)
          ? Math.max(0, Math.trunc(exercise.series))
          : 0,
    }))
    .filter((exercise) => exercise.exercise),
});

export const useTrainerTrainingPlanDayEditor = (
  planId: { value: string },
  planDayId: { value: string },
) => {
  const toast = useToast();

  const plan = ref<PlanFormDto | null>(null);
  const draft = ref<PlanDayFormDto>(createEmptyDraft());
  const allExercises = ref<ExerciseResponseDto[]>([]);
  const globalExercises = ref<ExerciseResponseDto[]>([]);

  const isLoadingPlan = ref(false);
  const hasPlanError = ref(false);
  const isLoadingPlanDay = ref(false);
  const hasPlanDayError = ref(false);
  const isLoadingExercises = ref(false);
  const hasExercisesError = ref(false);
  const isSaving = ref(false);

  const currentUserId = computed(() => getCurrentUser()?.id?.trim() ?? "");
  const isEditing = computed(() => Boolean(planDayId.value.trim()));
  const userExercises = computed(() =>
    allExercises.value.filter((exercise) => Boolean(exercise.user?.trim())),
  );

  let planToken = 0;
  let planDayToken = 0;
  let exercisesToken = 0;

  const loadPlan = async () => {
    if (!currentUserId.value || !planId.value.trim()) {
      plan.value = null;
      hasPlanError.value = true;
      return;
    }

    const currentToken = ++planToken;
    isLoadingPlan.value = true;
    hasPlanError.value = false;

    try {
      const response = await getApiIdGetPlansList(currentUserId.value);

      if (currentToken !== planToken) return;

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDayEditor.feedback.loadPlanFailed");
        hasPlanError.value = true;
        return;
      }

      const matchedPlan =
        (response.data ?? []).find((item) => item._id?.trim() === planId.value.trim()) ??
        null;

      if (!matchedPlan) {
        plan.value = null;
        hasPlanError.value = true;
        toast.error("trainerTrainingPlanDayEditor.feedback.loadPlanFailed");
        return;
      }

      plan.value = matchedPlan;
    } catch (error) {
      if (currentToken !== planToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDayEditor.feedback.loadPlanFailed");
      hasPlanError.value = true;
    } finally {
      if (currentToken === planToken) {
        isLoadingPlan.value = false;
      }
    }
  };

  const loadPlanDay = async () => {
    if (!planDayId.value.trim()) {
      draft.value = createEmptyDraft();
      hasPlanDayError.value = false;
      return;
    }

    const currentToken = ++planDayToken;
    isLoadingPlanDay.value = true;
    hasPlanDayError.value = false;
    draft.value = createEmptyDraft();

    try {
      const response = await getApiPlanDayIdGetPlanDay(planDayId.value.trim());

      if (currentToken !== planDayToken) return;

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDayEditor.feedback.loadPlanDayFailed");
        hasPlanDayError.value = true;
        return;
      }

      draft.value = mapPlanDayToDraft(response.data ?? null);
    } catch (error) {
      if (currentToken !== planDayToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDayEditor.feedback.loadPlanDayFailed");
      hasPlanDayError.value = true;
    } finally {
      if (currentToken === planDayToken) {
        isLoadingPlanDay.value = false;
      }
    }
  };

  const loadExercises = async () => {
    if (!currentUserId.value) {
      allExercises.value = [];
      globalExercises.value = [];
      hasExercisesError.value = true;
      return;
    }

    const currentToken = ++exercisesToken;
    isLoadingExercises.value = true;
    hasExercisesError.value = false;

    try {
      const [allResponse, globalResponse] = await Promise.all([
        getApiExerciseIdGetAllExercises(currentUserId.value),
        getApiExerciseGetAllGlobalExercises(),
      ]);

      if (currentToken !== exercisesToken) return;

      allExercises.value =
        allResponse.status === 200
          ? [...(allResponse.data ?? [])].sort((left, right) =>
              (left.name ?? "").localeCompare(right.name ?? ""),
            )
          : [];
      globalExercises.value =
        globalResponse.status === 200
          ? [...(globalResponse.data ?? [])].sort((left, right) =>
              (left.name ?? "").localeCompare(right.name ?? ""),
            )
          : [];

      if (allResponse.status !== 200 || globalResponse.status !== 200) {
        const message =
          getApiErrorMessage(allResponse.data) || getApiErrorMessage(globalResponse.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDayEditor.feedback.loadExercisesFailed");
        hasExercisesError.value = true;
      }
    } catch (error) {
      if (currentToken !== exercisesToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDayEditor.feedback.loadExercisesFailed");
      hasExercisesError.value = true;
      allExercises.value = [];
      globalExercises.value = [];
    } finally {
      if (currentToken === exercisesToken) {
        isLoadingExercises.value = false;
      }
    }
  };

  const loadInitialState = async () => {
    await Promise.all([loadPlan(), loadPlanDay(), loadExercises()]);
  };

  const savePlanDay = async () => {
    const payload = normalizeDraft(draft.value);

    if (!payload.name) {
      toast.error("trainerTrainingPlanDayEditor.feedback.nameRequired");
      return { success: false, createdPlanDayId: null as string | null };
    }

    if ((payload.exercises?.length ?? 0) === 0) {
      toast.error("trainerTrainingPlanDayEditor.feedback.exerciseRequired");
      return { success: false, createdPlanDayId: null as string | null };
    }

    isSaving.value = true;

    try {
      if (payload._id) {
        const response = await postApiPlanDayUpdatePlanDay(payload);

        if (response.status < 200 || response.status >= 300) {
          const message = getApiErrorMessage(response.data);
          if (message) toast.errorMessage(message);
          else toast.error("trainerTrainingPlanDayEditor.feedback.updateFailed");
          return { success: false, createdPlanDayId: null };
        }

        toast.success("trainerTrainingPlanDayEditor.feedback.updateSuccess");
        draft.value = payload;
        return { success: true, createdPlanDayId: payload._id };
      }

      const createResponse = await postApiPlanDayIdCreatePlanDay(planId.value, {
        name: payload.name,
        exercises: payload.exercises ?? [],
      });

      if (createResponse.status < 200 || createResponse.status >= 300) {
        const message = getApiErrorMessage(createResponse.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDayEditor.feedback.createFailed");
        return { success: false, createdPlanDayId: null };
      }

      const afterResponse = await getApiPlanDayIdGetPlanDaysInfo(planId.value);
      const createdPlanDayId =
        afterResponse.status === 200
          ? ((afterResponse.data ?? []).find((item) => item.name?.trim() === payload.name)
               ?._id?.trim() ??
             null)
          : null;

      toast.success("trainerTrainingPlanDayEditor.feedback.createSuccess");
      return { success: true, createdPlanDayId };
    } catch (error) {
      console.error(error);
      toast.error(
        draft.value._id
          ? "trainerTrainingPlanDayEditor.feedback.updateFailed"
          : "trainerTrainingPlanDayEditor.feedback.createFailed",
      );
      return { success: false, createdPlanDayId: null };
    } finally {
      isSaving.value = false;
    }
  };

  return {
    plan,
    draft,
    allExercises,
    userExercises,
    globalExercises,
    isEditing,
    isLoadingPlan,
    hasPlanError,
    isLoadingPlanDay,
    hasPlanDayError,
    isLoadingExercises,
    hasExercisesError,
    isSaving,
    loadInitialState,
    loadExercises,
    savePlanDay,
  };
};
