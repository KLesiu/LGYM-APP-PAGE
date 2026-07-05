<template>
  <div
 class="flex w-full max-w-md flex-col items-center px-5 py-5 text-center text-[var(--lgym-text)] sm:px-6 sm:py-6"
  >
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[var(--lgym-text)]">
          {{ t("auth.register.title") }}
        </h1>
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.register.subtitle") }}
        </p>
      </div>

      <div class="w-full">
        <v-form
          ref="formRef"
          v-model="isFormValid"
          validate-on="submit lazy"
          class="flex flex-col gap-5 text-left"
          @submit.prevent="submitForm"
        >
          <AuthTabs v-model="selectedRole" />

          <div class="grid gap-4">
            <v-text-field
              id="username"
              v-model="username"
              type="text"
              :label="t('auth.register.fields.username')"
              :placeholder="t('auth.register.placeholders.username')"
              :rules="usernameRules"
              autocomplete="username"
            />

            <v-text-field
              id="email"
              v-model="email"
              type="email"
              :label="t('auth.register.fields.email')"
              :placeholder="t('auth.register.placeholders.email')"
              :rules="emailRules"
              autocomplete="email"
            />

            <v-text-field
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :label="t('auth.register.fields.password')"
              :placeholder="t('auth.register.placeholders.password')"
              :rules="passwordRules"
              autocomplete="new-password"
              :append-inner-icon="
                showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              @click:append-inner="togglePassword"
            />

            <v-text-field
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :label="t('auth.register.fields.confirmPassword')"
              :placeholder="t('auth.register.placeholders.confirmPassword')"
              :rules="confirmPasswordRules"
              autocomplete="new-password"
              :append-inner-icon="
                showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              @click:append-inner="toggleConfirmPassword"
            />
          </div>

          <v-btn
            block
            color="primary"
            type="submit"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t("auth.register.actions.submit") }}
          </v-btn>
        </v-form>
      </div>

      <div class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.register.footer.haveAccount") }}
          <router-link
            to="/login"
            class="cursor-pointer bg-transparent p-0 text-[var(--lgym-text)] underline underline-offset-2"
          >
            {{ t("auth.register.footer.login") }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { RegisterUserRequest, ResponseMessageDto } from "../../api/model";
import { useToast } from "../../composables/useToast";
import {
  postApiRegister,
  postApiTrainerRegister,
} from "../../api/generated/demo";
import logoLgym from "../../assets/logoLGYM.png";

import AuthTabs from "./AuthTabs.vue";

type AuthRole = "athlete" | "trainer";

const { t } = useI18n();
const toast = useToast();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  reset: () => void;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);
const router = useRouter();

const selectedRole = ref<AuthRole>("athlete");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);

const usernameRules = [
  (value: string) => !!value || t("auth.validation.usernameRequired"),
  (value: string) => value.length >= 3 || t("auth.validation.usernameMin"),
];
const emailRules = [
  (value: string) => !!value || t("auth.validation.emailRequired"),
  (value: string) =>
    /.+@.+\..+/.test(value) || t("auth.validation.emailInvalid"),
];
const passwordRules = [
  (value: string) => !!value || t("auth.validation.passwordRequired"),
  (value: string) => value.length >= 6 || t("auth.validation.passwordMin"),
];
const confirmPasswordRules = [
  (value: string) => !!value || t("auth.validation.confirmPasswordRequired"),
  (value: string) =>
    value === password.value || t("auth.validation.passwordsMustMatch"),
];

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const registerByRole = async (payload: RegisterUserRequest) => {
  if (selectedRole.value === "trainer") return postApiTrainerRegister(payload);

  return postApiRegister(payload);
};

const performRegister = (response: ResponseMessageDto) => {
  console.info("Register submit", {
    role: selectedRole.value,
    username: username.value,
    email: email.value,
    hasPassword: password.value.length > 0,
    passwordsMatch: confirmPassword.value === password.value,
    responseMessage: response.msg ?? "",
  });
};

const resetForm = () => {
  formRef.value?.reset();
};

const resetFormValidation = () => {
  formRef.value?.resetValidation();
};

defineExpose({
  resetForm,
  resetFormValidation,
});

const submitForm = async () => {
  if (!formRef.value) return;

  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  isSubmitting.value = true;

  try {
    const payload: RegisterUserRequest = {
      name: username.value,
      email: email.value,
      password: password.value,
      cpassword: confirmPassword.value,
      isVisibleInRanking: true,
    };

    const response = await registerByRole(payload);

    if (response.status !== 200) {
      toast.error("auth.register.feedback.failed");
      return;
    }

    performRegister(response.data);
    toast.success("auth.register.feedback.success");
    resetFormValidation();
    await router.push("/login");
  } catch (error: unknown) {
    console.error(error);
    toast.error("auth.register.feedback.unexpectedError");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
