import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import {
  getApiIdGetPlansList,
  postApiIdCreatePlan,
  postApiIdDeletePlan,
  postApiIdSetNewActivePlan,
  postApiIdShare,
  postApiIdUpdatePlan,
} from "../api/generated/demo";
import type { PlanFormDto, ShareCodeResponseDto } from "../api/model";
import { getApiErrorMessage } from "../api/trainerInvitations";
import { getCurrentUser } from "./useCurrentUser";
import { handleTrainerUnauthorizedResponse } from "./useTrainerMembers";
import { useToast } from "./useToast";

const TRAINING_PLANS_ROUTE = "/trainer/training-plans";

const normalizeName = (value: string | null | undefined) => value?.trim() ?? "";

const isEmptyPlansResponse = (status: number, data: unknown) => {
  if (status === 204 || status === 404) return true;

  const message = getApiErrorMessage(data)?.toLocaleLowerCase("pl-PL") ?? "";
  return (
    message.includes("nie znaleziono") ||
    message.includes("no records") ||
    message.includes("not found")
  );
};

const getShareCodePayload = (value: unknown): ShareCodeResponseDto | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as ShareCodeResponseDto;
  return typeof candidate.shareCode === "string" ? candidate : null;
};

export const useTrainerTrainingPlans = () => {
  const router = useRouter();
  const toast = useToast();

  const plans = ref<PlanFormDto[]>([]);
  const isLoadingPlans = ref(false);
  const hasLoadError = ref(false);
  const savingPlanId = ref<string | null>(null);
  const deletingPlanId = ref<string | null>(null);
  const settingActivePlanId = ref<string | null>(null);
  const sharingPlanId = ref<string | null>(null);

  let requestToken = 0;

  const trainerId = computed(() => getCurrentUser()?.id?.trim() ?? "");
  const totalPlans = computed(() => plans.value.length);

  const ensureTrainerId = () => trainerId.value;

  const loadPlans = async () => {
    const contextTrainerId = ensureTrainerId();
    if (!contextTrainerId) {
      plans.value = [];
      hasLoadError.value = true;
      return;
    }

    const currentToken = ++requestToken;
    isLoadingPlans.value = true;
    hasLoadError.value = false;

    try {
      // The generated contract exposes workspace-level plan listing under /api/{id}/getPlansList.
      // Repo auth utilities expose only the current trainer id for this global trainer workspace.
      const response = await getApiIdGetPlansList(contextTrainerId);

      if (currentToken !== requestToken) return;

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          TRAINING_PLANS_ROUTE,
        )
      ) {
        return;
      }

      if (isEmptyPlansResponse(response.status, response.data)) {
        plans.value = [];
        return;
      }

      if (response.status !== 200) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlans.feedback.loadPlansFailed");
        hasLoadError.value = true;
        return;
      }

      plans.value = [...(response.data ?? [])].sort((left, right) => {
        if (left.isActive && !right.isActive) return -1;
        if (!left.isActive && right.isActive) return 1;
        return normalizeName(left.name).localeCompare(normalizeName(right.name));
      });
    } catch (error) {
      if (currentToken !== requestToken) return;

      console.error(error);
      toast.error("trainerTrainingPlans.feedback.loadPlansFailed");
      hasLoadError.value = true;
    } finally {
      if (currentToken === requestToken) {
        isLoadingPlans.value = false;
      }
    }
  };

  const savePlan = async (input: {
    planId?: string | null;
    name: string;
    isActive?: boolean | null;
  }) => {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      toast.error("trainerTrainingPlans.feedback.nameRequired");
      return false;
    }

    const contextTrainerId = ensureTrainerId();
    if (!contextTrainerId) {
      toast.error("trainerTrainingPlans.feedback.loadPlansFailed");
      return false;
    }

    savingPlanId.value = input.planId?.trim() || "new";

    try {
      const response = input.planId?.trim()
        ? await postApiIdUpdatePlan(contextTrainerId, {
            _id: input.planId.trim(),
            name: trimmedName,
            isActive: input.isActive ?? false,
          })
        : await postApiIdCreatePlan(contextTrainerId, {
            name: trimmedName,
            isActive: false,
          });

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          TRAINING_PLANS_ROUTE,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else {
          toast.error(
            input.planId?.trim()
              ? "trainerTrainingPlans.feedback.updatePlanFailed"
              : "trainerTrainingPlans.feedback.createPlanFailed",
          );
        }
        return false;
      }

      toast.success(
        input.planId?.trim()
          ? "trainerTrainingPlans.feedback.updatePlanSuccess"
          : "trainerTrainingPlans.feedback.createPlanSuccess",
      );
      await loadPlans();
      return true;
    } catch (error) {
      console.error(error);
      toast.error(
        input.planId?.trim()
          ? "trainerTrainingPlans.feedback.updatePlanFailed"
          : "trainerTrainingPlans.feedback.createPlanFailed",
      );
      return false;
    } finally {
      savingPlanId.value = null;
    }
  };

  const deletePlan = async (planId: string) => {
    const normalizedPlanId = planId.trim();
    if (!normalizedPlanId) return false;

    deletingPlanId.value = normalizedPlanId;

    try {
      const response = await postApiIdDeletePlan(normalizedPlanId);

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          TRAINING_PLANS_ROUTE,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlans.feedback.deletePlanFailed");
        return false;
      }

      toast.success("trainerTrainingPlans.feedback.deletePlanSuccess");
      await loadPlans();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlans.feedback.deletePlanFailed");
      return false;
    } finally {
      deletingPlanId.value = null;
    }
  };

  const setActivePlan = async (planId: string) => {
    const normalizedPlanId = planId.trim();
    const contextTrainerId = ensureTrainerId();
    if (!normalizedPlanId || !contextTrainerId) return false;

    settingActivePlanId.value = normalizedPlanId;

    try {
      const response = await postApiIdSetNewActivePlan(contextTrainerId, {
        _id: normalizedPlanId,
      });

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          TRAINING_PLANS_ROUTE,
        )
      ) {
        return false;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlans.feedback.setActiveFailed");
        return false;
      }

      toast.success("trainerTrainingPlans.feedback.setActiveSuccess");
      await loadPlans();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlans.feedback.setActiveFailed");
      return false;
    } finally {
      settingActivePlanId.value = null;
    }
  };

  const sharePlan = async (planId: string): Promise<ShareCodeResponseDto | null> => {
    const normalizedPlanId = planId.trim();
    if (!normalizedPlanId) return null;

    sharingPlanId.value = normalizedPlanId;

    try {
      const response = await postApiIdShare(normalizedPlanId);

      if (
        await handleTrainerUnauthorizedResponse(
          response.status,
          router,
          toast,
          TRAINING_PLANS_ROUTE,
        )
      ) {
        return null;
      }

      if (response.status < 200 || response.status >= 300) {
        const message = getApiErrorMessage(response.data);
        if (message) toast.errorMessage(message);
        else toast.error("trainerTrainingPlans.feedback.sharePlanFailed");
        return null;
      }

      const payload = getShareCodePayload(response.data);
      if (!payload) {
        toast.error("trainerTrainingPlans.feedback.sharePlanFailed");
        return null;
      }

      toast.success("trainerTrainingPlans.feedback.sharePlanSuccess");
      return payload;
    } catch (error) {
      console.error(error);
      toast.error("trainerTrainingPlans.feedback.sharePlanFailed");
      return null;
    } finally {
      sharingPlanId.value = null;
    }
  };

  return {
    plans,
    totalPlans,
    trainerId,
    isLoadingPlans,
    hasLoadError,
    savingPlanId,
    deletingPlanId,
    settingActivePlanId,
    sharingPlanId,
    loadPlans,
    savePlan,
    deletePlan,
    setActivePlan,
    sharePlan,
  };
};
