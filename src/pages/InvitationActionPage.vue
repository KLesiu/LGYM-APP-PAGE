<template>
  <v-container
    fluid
    class="flex min-h-screen items-center justify-center bg-[var(--lgym-page-glow),var(--lgym-bg)] px-4 py-5 sm:px-6 sm:py-6"
  >
    <section class="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
      <div class="border-b border-[var(--lgym-border)] px-6 py-6 sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--v-theme-primary))]">
          {{ t("invitationAction.eyebrow") }}
        </p>
        <h1 class="mt-3 text-2xl font-semibold text-[var(--lgym-text)] sm:text-3xl">
          {{ title }}
        </h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-[var(--lgym-text-muted)]">
          {{ description }}
        </p>
      </div>

      <div class="px-6 py-6 sm:px-8 sm:py-8">
        <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5">
          <div class="flex items-start gap-4">
            <div class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--lgym-surface-card)] text-[rgb(var(--v-theme-primary))]">
              <v-progress-circular v-if="status === 'processing' || status === 'redirecting'" indeterminate color="primary" size="26" width="3" />
              <v-icon v-else :icon="statusIcon" size="26" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-base font-semibold text-[var(--lgym-text)]">
                {{ statusTitle }}
              </p>
              <p class="mt-2 text-sm leading-7 text-[var(--lgym-text-muted)]">
                {{ statusMessage }}
              </p>
            </div>
          </div>

          <div v-if="status === 'error'" class="mt-5 flex flex-wrap gap-3">
            <v-btn
              variant="outlined"
              color="primary"
              class="min-h-11 rounded-xl px-5"
              @click="processInvitation"
            >
              {{ t("invitationAction.actions.retry") }}
            </v-btn>
          </div>
        </div>
      </div>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import {
  postApiTraineeInvitationsInvitationIdAccept,
  postApiTraineeInvitationsInvitationIdReject,
} from "../api/generated/demo";
import { getApiErrorMessage } from "../api/trainerInvitations";
import {
  clearAuthSession,
  getAuthToken,
  hasUserAccess,
} from "../composables/useAuthSession";
import { useToast } from "../composables/useToast";

type InvitationAction = "accept" | "reject";
type InvitationActionStatus = "processing" | "redirecting" | "success" | "error";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const status = ref<InvitationActionStatus>("processing");
const errorMessage = ref<string | null>(null);

const invitationId = computed(() => String(route.params.invitationId ?? "").trim());
const action = computed<InvitationAction | null>(() => {
  const value = String(route.params.action ?? "").trim().toLowerCase();
  return value === "accept" || value === "reject" ? value : null;
});

const title = computed(() =>
  action.value === "reject"
    ? t("invitationAction.reject.title")
    : t("invitationAction.accept.title"),
);

const description = computed(() =>
  action.value === "reject"
    ? t("invitationAction.reject.description")
    : t("invitationAction.accept.description"),
);

const statusTitle = computed(() => {
  if (status.value === "redirecting") {
    return t("invitationAction.status.redirecting.title");
  }

  if (status.value === "success") {
    return action.value === "reject"
      ? t("invitationAction.status.success.rejectTitle")
      : t("invitationAction.status.success.acceptTitle");
  }

  if (status.value === "error") {
    return t("invitationAction.status.error.title");
  }

  return t("invitationAction.status.processing.title");
});

const statusMessage = computed(() => {
  if (status.value === "redirecting") {
    return t("invitationAction.status.redirecting.message");
  }

  if (status.value === "success") {
    return action.value === "reject"
      ? t("invitationAction.status.success.rejectMessage")
      : t("invitationAction.status.success.acceptMessage");
  }

  if (status.value === "error") {
    return errorMessage.value || t("invitationAction.status.error.message");
  }

  return t("invitationAction.status.processing.message");
});

const statusIcon = computed(() => {
  if (status.value === "success") {
    return action.value === "reject" ? "mdi-close-circle-outline" : "mdi-check-circle-outline";
  }

  if (status.value === "error") {
    return "mdi-alert-circle-outline";
  }

  return "mdi-timer-sand";
});

const redirectToLogin = async () => {
  status.value = "redirecting";

  if (getAuthToken()) {
    clearAuthSession();
  }

  await router.replace({
    name: "login",
    query: {
      redirect: route.fullPath,
    },
  });
};

const processInvitation = async () => {
  errorMessage.value = null;

  if (!action.value || !invitationId.value) {
    status.value = "error";
    errorMessage.value = t("invitationAction.status.error.invalidLink");
    return;
  }

  if (!hasUserAccess()) {
    await redirectToLogin();
    return;
  }

  status.value = "processing";

  try {
    const response = action.value === "reject"
      ? await postApiTraineeInvitationsInvitationIdReject(invitationId.value)
      : await postApiTraineeInvitationsInvitationIdAccept(invitationId.value);
    const statusCode = Number(response.status);

    if (statusCode === 401 || statusCode === 403) {
      await redirectToLogin();
      return;
    }

    if (statusCode !== 200) {
      status.value = "error";
      errorMessage.value =
        getApiErrorMessage(response.data) || t("invitationAction.status.error.message");
      return;
    }

    status.value = "success";
    toast.success(
      action.value === "reject"
        ? "userRelationship.feedback.rejectSuccess"
        : "userRelationship.feedback.acceptSuccess",
    );
  } catch (error) {
    console.error(error);
    status.value = "error";
    errorMessage.value = t("invitationAction.status.error.message");
  }
};

onMounted(async () => {
  await processInvitation();
});
</script>
