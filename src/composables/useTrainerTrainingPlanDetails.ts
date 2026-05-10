import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import {
  getApiExerciseGetAllGlobalExercises,
  getApiIdGetPlansList,
  getApiPlanDayIdDeletePlanDay,
  getApiPlanDayIdGetPlanDay,
  getApiPlanDayIdGetPlanDaysInfo,
  postApiIdShare,
  postApiPlanDayIdCreatePlanDay,
  postApiPlanDayUpdatePlanDay,
} from "../api/generated/demo";
import type {
  ExerciseResponseDto,
  PlanDayBaseInfoDto,
  PlanDayExerciseInputDto,
  PlanDayFormDto,
  PlanDayVmDto,
  PlanFormDto,
  ShareCodeResponseDto,
} from "../api/model";
import { getApiErrorMessage } from "../api/trainerInvitations";
import { getCurrentUser } from "./useCurrentUser";
import { handleTrainerUnauthorizedResponse } from "./useTrainerMembers";
import { useToast } from "./useToast";

const createEmptyExerciseInput = (): PlanDayExerciseInputDto => ({
  exercise: null,
  reps: "",
  series: 3,
});

const toExerciseInput = (
  item: PlanDayVmDto["exercises"] extends (infer T)[] | null | undefined ? T : never,
): PlanDayExerciseInputDto => ({
  exercise: item?.exercise?._id ?? null,
  reps: item?.reps ?? "",
  series: item?.series ?? 0,
});

const normalizePlanDayForm = (input: PlanDayFormDto): PlanDayFormDto => ({
  _id: input._id?.trim() || null,
  name: input.name?.trim() || null,
  exercises: (input.exercises ?? [])
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

const getShareCodePayload = (value: unknown): ShareCodeResponseDto | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as ShareCodeResponseDto;
  return typeof candidate.shareCode === "string" ? candidate : null;
};

export const useTrainerTrainingPlanDetails = (planId: { value: string }) => {
  const router = useRouter();
  const toast = useToast();

  const plan = ref<PlanFormDto | null>(null);
  const planDaySummaries = ref<PlanDayBaseInfoDto[]>([]);
  const selectedPlanDayId = ref<string | null>(null);
  const selectedPlanDay = ref<PlanDayVmDto | null>(null);
  const exerciseOptions = ref<ExerciseResponseDto[]>([]);
  const shareCode = ref<string | null>(null);

  const isLoadingPlan = ref(false);
  const hasPlanError = ref(false);
  const isLoadingPlanDays = ref(false);
  const hasPlanDaysError = ref(false);
  const isLoadingSelectedPlanDay = ref(false);
  const hasSelectedPlanDayError = ref(false);
  const isLoadingExercises = ref(false);
  const hasExercisesError = ref(false);
  const isSavingPlanDay = ref(false);
  const deletingPlanDayId = ref<string | null>(null);
  const isSharingPlan = ref(false);

  let planRequestToken = 0;
  let planDaysRequestToken = 0;
  let selectedDayRequestToken = 0;
  let exercisesRequestToken = 0;

  const currentUserId = computed(() => getCurrentUser()?.id?.trim() ?? "");

  const redirectPath = computed(
    () => `/trainer/training-plans/${planId.value || ""}`,
  );

  const loadPlan = async () => {
    if (!planId.value || !currentUserId.value) {
      plan.value = null;
      hasPlanError.value = true;
      return;
    }

    const currentToken = ++planRequestToken;
    isLoadingPlan.value = true;
    hasPlanError.value = false;

    try {
      const response = await getApiIdGetPlansList(currentUserId.value);

      if (currentToken !== planRequestToken) return;

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return;
      }

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.loadPlanFailed");
        hasPlanError.value = true;
        return;
      }

      const matchedPlan =
        (response.data ?? []).find((item) => item._id?.trim() === planId.value.trim()) ??
        null;

      if (!matchedPlan) {
        toast.error("trainerTrainingPlanDetails.feedback.loadPlanFailed");
        hasPlanError.value = true;
        plan.value = null;
        return;
      }

      plan.value = matchedPlan;
    } catch (error) {
      if (currentToken !== planRequestToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.loadPlanFailed");
      hasPlanError.value = true;
    } finally {
      if (currentToken === planRequestToken) {
        isLoadingPlan.value = false;
      }
    }
  };

  const loadPlanDaySummaries = async (preserveSelection = true) => {
    if (!planId.value) {
      planDaySummaries.value = [];
      hasPlanDaysError.value = true;
      return;
    }

    const currentToken = ++planDaysRequestToken;
    isLoadingPlanDays.value = true;
    hasPlanDaysError.value = false;
    const previousSelected = preserveSelection ? selectedPlanDayId.value : null;

    try {
      const response = await getApiPlanDayIdGetPlanDaysInfo(planId.value);
      const responseStatus = Number(response.status);

      if (currentToken !== planDaysRequestToken) return;

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return;
      }

      if (responseStatus === 404 || responseStatus === 204) {
        planDaySummaries.value = [];
        selectedPlanDayId.value = null;
        hasPlanDaysError.value = false;
        return;
      }

      if (responseStatus !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.loadPlanDaysFailed");
        hasPlanDaysError.value = true;
        return;
      }

      planDaySummaries.value = Array.isArray(response.data) ? response.data : [];

      const selectedExists = planDaySummaries.value.some(
        (item) => item._id?.trim() === previousSelected,
      );

      if (selectedExists) {
        selectedPlanDayId.value = previousSelected;
      } else {
        selectedPlanDayId.value = planDaySummaries.value[0]?._id?.trim() || null;
      }
    } catch (error) {
      if (currentToken !== planDaysRequestToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.loadPlanDaysFailed");
      hasPlanDaysError.value = true;
    } finally {
      if (currentToken === planDaysRequestToken) {
        isLoadingPlanDays.value = false;
      }
    }
  };

  const loadSelectedPlanDay = async (nextPlanDayId?: string | null) => {
    const normalizedPlanDayId =
      nextPlanDayId === undefined
        ? selectedPlanDayId.value
        : (nextPlanDayId?.trim() || null);
    selectedPlanDayId.value = normalizedPlanDayId || null;

    if (!normalizedPlanDayId) {
      selectedPlanDay.value = null;
      hasSelectedPlanDayError.value = false;
      return;
    }

    const currentToken = ++selectedDayRequestToken;
    isLoadingSelectedPlanDay.value = true;
    hasSelectedPlanDayError.value = false;
    selectedPlanDay.value = null;

    try {
      const response = await getApiPlanDayIdGetPlanDay(normalizedPlanDayId);

      if (currentToken !== selectedDayRequestToken) return;

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return;
      }

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.loadPlanDayFailed");
        selectedPlanDay.value = null;
        hasSelectedPlanDayError.value = true;
        return;
      }

      selectedPlanDay.value = response.data ?? null;
    } catch (error) {
      if (currentToken !== selectedDayRequestToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.loadPlanDayFailed");
      selectedPlanDay.value = null;
      hasSelectedPlanDayError.value = true;
    } finally {
      if (currentToken === selectedDayRequestToken) {
        isLoadingSelectedPlanDay.value = false;
      }
    }
  };

  const loadExercises = async () => {
    const currentToken = ++exercisesRequestToken;
    isLoadingExercises.value = true;
    hasExercisesError.value = false;

    try {
      const response = await getApiExerciseGetAllGlobalExercises();

      if (currentToken !== exercisesRequestToken) return;

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return;
      }

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.loadExercisesFailed");
        hasExercisesError.value = true;
        return;
      }

      exerciseOptions.value = [...(response.data ?? [])].sort((left, right) =>
        (left.name ?? "").localeCompare(right.name ?? ""),
      );
    } catch (error) {
      if (currentToken !== exercisesRequestToken) return;

      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.loadExercisesFailed");
      hasExercisesError.value = true;
    } finally {
      if (currentToken === exercisesRequestToken) {
        isLoadingExercises.value = false;
      }
    }
  };

  const createPlanDay = async (input: PlanDayFormDto) => {
    if (!planId.value) return false;

    const payload = normalizePlanDayForm(input);
    if (!payload.name) {
      toast.error("trainerTrainingPlanDetails.feedback.planDayNameRequired");
      return false;
    }

    isSavingPlanDay.value = true;
    const existingIds = new Set(
      planDaySummaries.value.map((item) => item._id?.trim()).filter(Boolean),
    );

    try {
      const response = await postApiPlanDayIdCreatePlanDay(planId.value, {
        name: payload.name,
        exercises: payload.exercises ?? [],
      });

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.createPlanDayFailed");
        return false;
      }

      toast.success("trainerTrainingPlanDetails.feedback.createPlanDaySuccess");
      await loadPlanDaySummaries(false);

      const newPlanDay =
        planDaySummaries.value.find(
          (item) => item._id?.trim() && !existingIds.has(item._id.trim()),
        ) ??
        planDaySummaries.value.find((item) => item.name?.trim() === payload.name) ??
        planDaySummaries.value[0] ??
        null;

      await loadSelectedPlanDay(newPlanDay?._id ?? null);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.createPlanDayFailed");
      return false;
    } finally {
      isSavingPlanDay.value = false;
    }
  };

  const updatePlanDay = async (input: PlanDayFormDto) => {
    const payload = normalizePlanDayForm(input);
    if (!payload._id) return false;
    if (!payload.name) {
      toast.error("trainerTrainingPlanDetails.feedback.planDayNameRequired");
      return false;
    }

    isSavingPlanDay.value = true;

    try {
      const response = await postApiPlanDayUpdatePlanDay(payload);

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.updatePlanDayFailed");
        return false;
      }

      toast.success("trainerTrainingPlanDetails.feedback.updatePlanDaySuccess");
      await Promise.all([loadPlanDaySummaries(), loadSelectedPlanDay(payload._id)]);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.updatePlanDayFailed");
      return false;
    } finally {
      isSavingPlanDay.value = false;
    }
  };

  const savePlanDay = async (input: PlanDayFormDto) => {
    if (input._id?.trim()) {
      return updatePlanDay(input);
    }
    return createPlanDay(input);
  };

  const deletePlanDay = async (planDayId: string) => {
    const normalizedPlanDayId = planDayId.trim();
    if (!normalizedPlanDayId) return false;
    const wasSelectedPlanDay = selectedPlanDayId.value === normalizedPlanDayId;
    const nextSelectedPlanDayId = wasSelectedPlanDay
      ? null
      : selectedPlanDayId.value;

    deletingPlanDayId.value = normalizedPlanDayId;

    try {
      const response = await getApiPlanDayIdDeletePlanDay(normalizedPlanDayId);

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.deletePlanDayFailed");
        return false;
      }

      toast.success("trainerTrainingPlanDetails.feedback.deletePlanDaySuccess");
      await loadPlanDaySummaries(!wasSelectedPlanDay);

      if (wasSelectedPlanDay) {
        await loadSelectedPlanDay(planDaySummaries.value[0]?._id ?? null);
      } else if (nextSelectedPlanDayId?.trim()) {
        await loadSelectedPlanDay(nextSelectedPlanDayId);
      }

      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.deletePlanDayFailed");
      return false;
    } finally {
      deletingPlanDayId.value = null;
    }
  };

  const sharePlan = async (): Promise<ShareCodeResponseDto | null> => {
    if (!planId.value) return null;

    isSharingPlan.value = true;

    try {
      const response = await postApiIdShare(planId.value);

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          redirectPath.value,
        )
      ) {
        return null;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlanDetails.feedback.sharePlanFailed");
        return null;
      }

      const payload = getShareCodePayload(response.data);
      if (!payload) {
        toast.error("trainerTrainingPlanDetails.feedback.sharePlanFailed");
        return null;
      }

      shareCode.value = payload.shareCode?.trim() || null;
      toast.success("trainerTrainingPlanDetails.feedback.sharePlanSuccess");
      return payload;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlanDetails.feedback.sharePlanFailed");
      return null;
    } finally {
      isSharingPlan.value = false;
    }
  };

  const buildEditablePlanDay = (source?: PlanDayVmDto | null): PlanDayFormDto => ({
    _id: source?._id ?? null,
    name: source?.name ?? "",
    exercises:
      source?.exercises?.map((exercise) => toExerciseInput(exercise)) ??
      [createEmptyExerciseInput()],
  });

  const createNewPlanDayDraft = () => ({
    _id: null,
    name: "",
    exercises: [createEmptyExerciseInput()],
  });

  const loadInitialState = async () => {
    shareCode.value = null;
    selectedPlanDay.value = null;
    selectedPlanDayId.value = null;
    await Promise.all([loadPlan(), loadPlanDaySummaries(false), loadExercises()]);
  };

  return {
    plan,
    planDaySummaries,
    selectedPlanDayId,
    selectedPlanDay,
    exerciseOptions,
    shareCode,
    isLoadingPlan,
    hasPlanError,
    isLoadingPlanDays,
    hasPlanDaysError,
    isLoadingSelectedPlanDay,
    hasSelectedPlanDayError,
    isLoadingExercises,
    hasExercisesError,
    isSavingPlanDay,
    deletingPlanDayId,
    isSharingPlan,
    loadPlan,
    loadPlanDaySummaries,
    loadSelectedPlanDay,
    loadExercises,
    loadInitialState,
    savePlanDay,
    createPlanDay,
    updatePlanDay,
    deletePlanDay,
    sharePlan,
    buildEditablePlanDay,
    createNewPlanDayDraft,
  };
};
