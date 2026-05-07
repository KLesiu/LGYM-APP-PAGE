import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  getApiInvitationsInvitationId,
  getApiTraineeInvitations,
  postApiTraineeInvitationsInvitationIdAccept,
  postApiTraineeInvitationsInvitationIdReject,
} from "../api/generated/demo";
import type {
  GetApiInvitationsInvitationIdParams,
  PublicInvitationStatusDto,
  TrainerInvitationDto,
} from "../api/model";
import { getApiErrorMessage } from "../api/trainerInvitations";
import { clearAuthSession } from "./useAuthSession";
import { getCurrentUser } from "./useCurrentUser";
import { useToast } from "./useToast";

export type UserRelationshipViewState =
  | "loading"
  | "error"
  | "empty"
  | "pending"
  | "accepted"
  | "rejected"
  | "expired";

const normalizeInvitationStatus = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? "";

export const useUserTrainerRelationship = () => {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const invitationStatus = ref<PublicInvitationStatusDto | null>(null);
  const pendingInvitations = ref<TrainerInvitationDto[]>([]);
  const viewState = ref<UserRelationshipViewState>("loading");
  const errorKey = ref<string | null>(null);
  const isLoading = ref(false);
  const isSubmittingAccept = ref(false);
  const isSubmittingReject = ref(false);
  const submittingInvitationId = ref<string | null>(null);

  let requestToken = 0;

  const invitationId = computed(() => String(route.params.invitationId ?? "").trim());
  const invitationCode = computed(() => String(route.query.code ?? "").trim());
  const hasInvitationContext = computed(
    () => invitationId.value.length > 0 && invitationCode.value.length > 0,
  );
  const currentUser = computed(() => getCurrentUser());
  const normalizedInvitationStatus = computed(() =>
    normalizeInvitationStatus(
      invitationStatus.value?.status ?? activeInvitation.value?.status,
    ),
  );
  const activeInvitation = computed(
    () => pendingInvitations.value.find((item) => normalizeInvitationStatus(item.status) === "pending") ?? null,
  );
  const activeInvitationId = computed(
    () => invitationId.value || activeInvitation.value?._id?.trim() || "",
  );
  const hasKnownAccount = computed(
    () =>
      !!currentUser.value?.name?.trim() ||
      !!currentUser.value?.email?.trim() ||
      !!currentUser.value?.id?.trim(),
  );
  const isInvitationActionable = computed(
    () => activeInvitationId.value.length > 0 && normalizedInvitationStatus.value === "pending",
  );

  const invitationQuery = computed<GetApiInvitationsInvitationIdParams | undefined>(() => {
    if (!invitationCode.value) return undefined;
    return { code: invitationCode.value };
  });

  const handleUnauthorizedResponse = async (status: number) => {
    if (status !== 401 && status !== 403) return false;

    clearAuthSession();
    await router.push({
      name: "login",
      query: {
        redirect: route.fullPath,
      },
    });
    return true;
  };

  const loadInvitationStatus = async () => {
    if (!hasInvitationContext.value) {
      invitationStatus.value = null;
      return "missing-context" as const;
    }

    const response = await getApiInvitationsInvitationId(
      invitationId.value,
      invitationQuery.value,
    );

    if (await handleUnauthorizedResponse(response.status)) {
      return "unauthorized" as const;
    }

    if (response.status !== 200) {
      invitationStatus.value = null;
      return "not-found" as const;
    }

    invitationStatus.value = response.data ?? null;
    return "loaded" as const;
  };

  const loadPendingInvitations = async () => {
    pendingInvitations.value = [];

    if (hasInvitationContext.value) return "skipped" as const;

    const response = await getApiTraineeInvitations();

    if (await handleUnauthorizedResponse(response.status)) {
      return "unauthorized" as const;
    }

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      errorKey.value =
        message ||
        (response.status === 404
          ? "userRelationship.feedback.invitationsEndpointMissing"
          : "userRelationship.feedback.loadFailed");
      return "error" as const;
    }

    pendingInvitations.value = Array.isArray(response.data) ? response.data : [];
    return "loaded" as const;
  };

  const deriveState = (): UserRelationshipViewState => {
    if (!hasInvitationContext.value && activeInvitation.value) return "pending";
    if (!hasInvitationContext.value) return "empty";
    if (!invitationStatus.value) return "empty";

    const status = normalizedInvitationStatus.value;

    if (status === "pending") return "pending";
    if (status === "accepted") return "accepted";
    if (status === "rejected") return "rejected";
    if (status === "expired" || status === "revoked") return "expired";

    return "empty";
  };

  const load = async () => {
    const currentToken = ++requestToken;
    isLoading.value = true;
    errorKey.value = null;

    try {
      const invitationLoadResult = hasInvitationContext.value
        ? await loadInvitationStatus()
        : await loadPendingInvitations();

      if (currentToken !== requestToken) return;

      if (invitationLoadResult === "unauthorized") {
        viewState.value = "empty";
        return;
      }

      if (invitationLoadResult === "error") {
        viewState.value = "error";
        return;
      }

      viewState.value = deriveState();
    } catch (error) {
      if (currentToken !== requestToken) return;

      console.error(error);
      errorKey.value = "userRelationship.feedback.loadFailed";
      viewState.value = "error";
    } finally {
      if (currentToken === requestToken) {
        isLoading.value = false;
      }
    }
  };

  const acceptInvitation = async (targetInvitationId = activeInvitationId.value) => {
    const normalizedInvitationId = targetInvitationId.trim();
    if (!normalizedInvitationId) return false;

    submittingInvitationId.value = normalizedInvitationId;
    isSubmittingAccept.value = true;
    try {
      const response = await postApiTraineeInvitationsInvitationIdAccept(normalizedInvitationId);
      if (await handleUnauthorizedResponse(response.status)) {
        return false;
      }

      if (response.status !== 200) {
        toast.error("userRelationship.feedback.acceptFailed");
        return false;
      }

      toast.success("userRelationship.feedback.acceptSuccess");
      await load();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("userRelationship.feedback.acceptFailed");
      return false;
    } finally {
      isSubmittingAccept.value = false;
      submittingInvitationId.value = null;
    }
  };

  const rejectInvitation = async (targetInvitationId = activeInvitationId.value) => {
    const normalizedInvitationId = targetInvitationId.trim();
    if (!normalizedInvitationId) return false;

    submittingInvitationId.value = normalizedInvitationId;
    isSubmittingReject.value = true;
    try {
      const response = await postApiTraineeInvitationsInvitationIdReject(normalizedInvitationId);
      if (await handleUnauthorizedResponse(response.status)) {
        return false;
      }

      if (response.status !== 200) {
        toast.error("userRelationship.feedback.rejectFailed");
        return false;
      }

      toast.success("userRelationship.feedback.rejectSuccess");
      await load();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("userRelationship.feedback.rejectFailed");
      return false;
    } finally {
      isSubmittingReject.value = false;
      submittingInvitationId.value = null;
    }
  };

  const openBaseRelationshipView = async () => {
    await router.replace({ name: "user-relationship-status" });
  };

  return {
    currentUser,
    invitationId,
    invitationCode,
    activeInvitation,
    activeInvitationId,
    pendingInvitations,
    hasInvitationContext,
    hasKnownAccount,
    invitationStatus,
    normalizedInvitationStatus,
    isInvitationActionable,
    viewState,
    errorKey,
    isLoading,
    isSubmittingAccept,
    isSubmittingReject,
    submittingInvitationId,
    load,
    acceptInvitation,
    rejectInvitation,
    openBaseRelationshipView,
  };
};
