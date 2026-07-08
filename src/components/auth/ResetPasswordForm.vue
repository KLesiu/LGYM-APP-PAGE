<template>
  <div
    class="flex w-full max-w-md flex-col items-center px-5 py-5 text-center text-[var(--lgym-text)] sm:px-6 sm:py-6"
  >
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[var(--lgym-text)]">
          {{ t("auth.resetPassword.title") }}
        </h1>
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.resetPassword.subtitle") }}
        </p>
      </div>

      <v-alert
        v-if="!resetToken && !isSuccess"
        type="warning"
        variant="tonal"
        class="w-full text-left"
      >
        <div class="flex flex-col gap-1">
          <strong>{{ t("auth.resetPassword.states.missingTokenTitle") }}</strong>
          <span>{{ t("auth.resetPassword.states.missingTokenDescription") }}</span>
        </div>
      </v-alert>

      <div class="w-full">
        <v-form
          v-if="!isSuccess"
          ref="formRef"
          v-model="isFormValid"
          validate-on="submit lazy"
          class="flex flex-col gap-5 text-left"
          @submit.prevent="submitForm"
        >
          <v-text-field
            id="newPassword"
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            :label="t('auth.resetPassword.fields.newPassword')"
            :placeholder="t('auth.resetPassword.placeholders.newPassword')"
            :rules="passwordRules"
            autocomplete="new-password"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            :disabled="!resetToken || isSubmitting"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :label="t('auth.resetPassword.fields.confirmPassword')"
            :placeholder="t('auth.resetPassword.placeholders.confirmPassword')"
            :rules="confirmPasswordRules"
            autocomplete="new-password"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            :disabled="!resetToken || isSubmitting"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />

          <v-btn
            block
            color="primary"
            type="submit"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting || !resetToken"
          >
            {{ t("auth.resetPassword.actions.submit") }}
          </v-btn>

          <v-btn
            block
            variant="text"
            color="primary"
            size="large"
            :disabled="isSubmitting"
            @click="goToForgotPassword"
          >
            {{ t("auth.resetPassword.actions.requestNewLink") }}
          </v-btn>
        </v-form>

        <div v-else class="flex flex-col gap-4">
          <v-alert type="success" variant="tonal" class="w-full text-left">
            {{ t("auth.resetPassword.states.successDescription") }}
          </v-alert>

          <v-btn block color="primary" size="large" @click="router.push('/login')">
            {{ t("auth.resetPassword.actions.backToLogin") }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { getApiErrorMessage, postApiResetPassword } from "../../api/auth";
import logoLgym from "../../assets/logoLGYM.png";
import { useToast } from "../../composables/useToast";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);
const isSuccess = ref(false);
const resetToken = ref("");

onMounted(async () => {
  const token = route.query.token;
  if (typeof token === "string") {
    resetToken.value = token.trim();
  }

  if (!("token" in route.query)) {
    return;
  }

  const { token: _token, ...restQuery } = route.query;
  await router.replace({
    path: route.path,
    query: restQuery,
    hash: route.hash,
  });
});

const passwordRules = [
  (value: string) => !!value || t("auth.validation.passwordRequired"),
  (value: string) => value.length >= 6 || t("auth.validation.passwordMin"),
];

const confirmPasswordRules = [
  (value: string) => !!value || t("auth.validation.confirmPasswordRequired"),
  (value: string) => value === newPassword.value || t("auth.validation.passwordsMustMatch"),
];

const goToForgotPassword = async () => {
  await router.push("/forgot-password");
};

const submitForm = async () => {
  if (!resetToken.value) {
    toast.error("auth.resetPassword.feedback.failed");
    return;
  }

  if (!formRef.value) return;

  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  isSubmitting.value = true;

  try {
    const response = await postApiResetPassword({
      token: resetToken.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    });

    if (response.status === 200) {
      toast.successMessage(
        getApiErrorMessage(response.data) ?? t("auth.resetPassword.feedback.success"),
      );
      isSuccess.value = true;
      formRef.value.resetValidation();
      return;
    }

    const message = getApiErrorMessage(response.data);
    if (message) toast.errorMessage(message);
    else toast.error("auth.resetPassword.feedback.failed");
  } catch (error) {
    console.error(error);
    toast.error("auth.resetPassword.feedback.unexpectedError");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
