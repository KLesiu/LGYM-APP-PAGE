<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <AppDataSection
      :eyebrow="t('trainerSettings.page.eyebrow')"
      :title="t('trainerSettings.page.title')"
      :subtitle="t('trainerSettings.page.subtitle')"
      :show-pagination="false"
      class="flex-1"
    >
      <div class="flex flex-col gap-4 px-6 py-6 lg:px-8 lg:py-8">
        <section class="flex flex-col gap-4 px-0 py-0">
          <div class="lgym-section-heading max-w-3xl">
            <h2 class="text-xl font-semibold text-[var(--lgym-text)]">
              {{ t("trainerSettings.google.title") }}
            </h2>
            <p class="lgym-section-heading__subtitle text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerSettings.google.subtitle") }}
            </p>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex min-w-0 items-start gap-3">
                <div class="inline-flex h-12 w-12 items-center justify-center text-[rgb(var(--v-theme-primary))]">
                  <v-icon icon="mdi-google" size="24" />
                </div>
                <div class="min-w-0 space-y-1">
                  <p class="font-semibold text-[var(--lgym-text)]">
                    {{ t("trainerSettings.google.provider") }}
                  </p>
                  <p class="break-all text-sm text-[var(--lgym-text-muted)]">
                    {{ linkedGoogleEmail || t("trainerSettings.google.notLinked") }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <v-chip
                  :color="linkedGoogleLogin ? 'success' : 'default'"
                  :variant="linkedGoogleLogin ? 'flat' : 'outlined'"
                  size="small"
                  class="font-semibold"
                >
                  {{
                    linkedGoogleLogin
                      ? t("trainerSettings.google.statusLinked")
                      : t("trainerSettings.google.statusNotLinked")
                  }}
                </v-chip>

                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-google"
                  class="min-h-10 rounded-md px-4"
                  :loading="isLinkingGoogle"
                  :disabled="isLinkingGoogle || isLoadingExternalLogins || isGoogleLinked"
                  @click="linkGoogleAccount"
                >
                  {{
                    isGoogleLinked
                      ? t("trainerSettings.google.alreadyLinked")
                      : t("trainerSettings.google.linkAction")
                  }}
                </v-btn>
              </div>
            </div>

            <v-alert
              v-if="hasLoadError"
              type="error"
              variant="tonal"
              :text="t('trainerSettings.feedback.loadFailed')"
            />

            <div
              v-else-if="isLoadingExternalLogins"
              class="flex items-center gap-3 text-sm text-[var(--lgym-text-muted)]"
            >
              <v-progress-circular indeterminate color="primary" size="20" width="2" />
              <span>{{ t("trainerSettings.google.loading") }}</span>
            </div>
          </div>
        </section>
      </div>
    </AppDataSection>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  getApiAccountExternalLogins,
  getApiErrorMessage,
  postApiAccountLinkGoogle,
  type ExternalLoginDto,
} from "../../api/account";
import AppDataSection from "../../components/ui/AppDataSection.vue";
import { clearAuthSession } from "../../composables/useAuthSession";
import { useGoogleAuth, type GoogleAuthFailure } from "../../composables/useGoogleAuth";
import { useToast } from "../../composables/useToast";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const { signInWithGoogle, handleGoogleAuthFailure } = useGoogleAuth();

const externalLogins = ref<ExternalLoginDto[]>([]);
const isLoadingExternalLogins = ref(false);
const isLinkingGoogle = ref(false);
const hasLoadError = ref(false);

const linkedGoogleLogin = computed(
  () =>
    externalLogins.value.find(
      (login) => (login.provider ?? "").trim().toLowerCase() === "google",
    ) ?? null,
);

const linkedGoogleEmail = computed(
  () => linkedGoogleLogin.value?.providerEmail?.trim() ?? "",
);
const isGoogleLinked = computed(() => linkedGoogleLogin.value !== null);

const redirectToLogin = async () => {
  clearAuthSession();
  await router.push({
    name: "login",
    query: {
      redirect: "/trainer/settings",
    },
  });
};

const handleUnauthorizedResponse = async (status: number) => {
  if (status !== 401 && status !== 403) return false;

  toast.error("trainerSettings.feedback.unauthorized");
  await redirectToLogin();
  return true;
};

const loadExternalLogins = async () => {
  isLoadingExternalLogins.value = true;
  hasLoadError.value = false;

  try {
    const response = await getApiAccountExternalLogins();

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status !== 200) {
      hasLoadError.value = true;
      const message = getApiErrorMessage(response.data);
      if (message) {
        toast.errorMessage(message);
      } else {
        toast.error("trainerSettings.feedback.loadFailed");
      }
      return;
    }

    externalLogins.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    hasLoadError.value = true;
    toast.error("trainerSettings.feedback.loadFailed");
  } finally {
    isLoadingExternalLogins.value = false;
  }
};

const linkGoogleAccount = async () => {
  if (isGoogleLinked.value) return;

  isLinkingGoogle.value = true;

  try {
    const result = await signInWithGoogle();
    const response = await postApiAccountLinkGoogle(result.idToken, result.accessToken);

    if (await handleUnauthorizedResponse(response.status)) return;

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) {
        toast.errorMessage(message);
      } else {
        toast.error("trainerSettings.feedback.linkFailed");
      }
      return;
    }

    toast.success("trainerSettings.feedback.linkSuccess");
    await loadExternalLogins();
  } catch (error) {
    if (error && typeof error === "object" && "reason" in error) {
      handleGoogleAuthFailure(error as GoogleAuthFailure);
      return;
    }

    toast.error("trainerSettings.feedback.linkFailed");
  } finally {
    isLinkingGoogle.value = false;
  }
};

onMounted(async () => {
  await loadExternalLogins();
});
</script>
