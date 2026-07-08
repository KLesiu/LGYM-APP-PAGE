<template>
  <div
    class="flex w-full max-w-md flex-col items-center px-5 py-5 text-center text-[var(--lgym-text)] sm:px-6 sm:py-6"
  >
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[var(--lgym-text)]">
          {{ t("auth.forgotPassword.title") }}
        </h1>
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.forgotPassword.subtitle") }}
        </p>
      </div>

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
            id="email"
            v-model="email"
            type="email"
            :label="t('auth.forgotPassword.fields.email')"
            :placeholder="t('auth.forgotPassword.placeholders.email')"
            :rules="emailRules"
            autocomplete="email"
          />

          <v-btn
            block
            color="primary"
            type="submit"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t("auth.forgotPassword.actions.submit") }}
          </v-btn>
        </v-form>

        <v-alert v-else type="success" variant="tonal" class="w-full text-left">
          {{ t("auth.forgotPassword.states.successDescription") }}
        </v-alert>
      </div>

      <div class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.forgotPassword.footer.rememberedPassword") }}
          <router-link
            to="/login"
            class="cursor-pointer bg-transparent p-0 text-[var(--lgym-text)] underline underline-offset-2"
          >
            {{ isSuccess ? t("auth.forgotPassword.actions.backToLogin") : t("auth.forgotPassword.footer.login") }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { getApiErrorMessage, postApiForgotPassword } from "../../api/auth";
import logoLgym from "../../assets/logoLGYM.png";
import { useToast } from "../../composables/useToast";

const { t } = useI18n();
const toast = useToast();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);
const email = ref("");
const isSubmitting = ref(false);
const isSuccess = ref(false);

const emailRules = [
  (value: string) => !!value || t("auth.validation.emailRequired"),
  (value: string) => /.+@.+\..+/.test(value) || t("auth.validation.emailInvalid"),
];

const submitForm = async () => {
  if (!formRef.value) return;

  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  isSubmitting.value = true;

  try {
    const response = await postApiForgotPassword({
      email: email.value.trim(),
    });

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("auth.forgotPassword.feedback.failed");
      return;
    }

    toast.successMessage(
      getApiErrorMessage(response.data) ?? t("auth.forgotPassword.feedback.success"),
    );
    isSuccess.value = true;
    formRef.value.resetValidation();
  } catch (error) {
    console.error(error);
    toast.error("auth.forgotPassword.feedback.unexpectedError");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
