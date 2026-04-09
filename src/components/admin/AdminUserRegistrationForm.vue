<template>
  <v-card
    rounded="[32px]"
    class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
  >
    <div
      class="relative overflow-hidden bg-[var(--lgym-register-top-bg)] px-5 py-5 sm:px-6"
    >
      <p
        class="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--v-theme-primary))]"
      >
        {{ t("admin.register.eyebrow") }}
      </p>
      <h2 class="mt-3 text-2xl font-semibold text-[var(--lgym-text)]">
        {{ t("admin.register.title") }}
      </h2>
      <p class="mt-2 max-w-md text-sm leading-6 text-[var(--lgym-text-muted)]">
        {{ t("admin.register.subtitle") }}
      </p>
      <p
        class="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]"
      >
        {{ t("admin.register.scope") }}
      </p>
      <div
        class="absolute -right-10 -bottom-20 h-[180px] w-[180px] rounded-full bg-[var(--lgym-register-glow)] pointer-events-none"
      ></div>
    </div>

    <v-card-text class="flex flex-col gap-5 px-5 py-5 sm:px-6">
      <v-form
        ref="formRef"
        v-model="isFormValid"
        validate-on="submit lazy"
        class="flex flex-col gap-5"
        @submit.prevent="submitForm"
      >
        <div
          class="rounded-[22px] p-2 border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]"
        >
          <AuthTabs v-model="selectedRole" />
        </div>

        <v-alert
          v-if="submitError"
          type="error"
          class="rounded-2xl"
          :text="submitError"
        />

        <v-alert
          v-if="submitSuccess"
          type="success"
          class="rounded-2xl"
          :text="submitSuccess"
        />

        <div class="grid gap-4">
          <v-text-field
            v-model="username"
            :label="t('auth.register.fields.username')"
            :placeholder="t('auth.register.placeholders.username')"
            :rules="usernameRules"
            autocomplete="username"
          />

          <v-text-field
            v-model="email"
            type="email"
            :label="t('auth.register.fields.email')"
            :placeholder="t('auth.register.placeholders.email')"
            :rules="emailRules"
            autocomplete="email"
          />

          <v-text-field
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

        <div
          class="rounded-[24px] p-4 border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]"
        >
          <div class="flex items-start gap-3">
            <div
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--lgym-note-icon-bg)] text-[var(--lgym-note-icon-text)]"
            >
              <v-icon icon="mdi-account-plus-outline" size="22" />
            </div>
            <p class="text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("admin.register.note") }}
            </p>
          </div>
        </div>

        <v-btn
          type="submit"
          color="primary"
          size="large"
          class="min-h-12 normal-case tracking-normal font-semibold"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          {{ t("admin.register.actions.submit") }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import {
  postApiRegister,
  postApiTrainerRegister,
} from "../../api/generated/demo";
import type { RegisterUserRequest, ResponseMessageDto } from "../../api/model";
import AuthTabs from "../auth/AuthTabs.vue";

type AuthRole = "athlete" | "trainer";

const emit = defineEmits<{
  registered: [];
}>();

const { t } = useI18n();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  reset: () => void;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);

const selectedRole = ref<AuthRole>("athlete");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");

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

const extractMessage = (data: ResponseMessageDto | null | undefined) =>
  data?.msg ?? "";

const registerByRole = async (payload: RegisterUserRequest) => {
  if (selectedRole.value === "trainer") return postApiTrainerRegister(payload);

  return postApiRegister(payload);
};

const resetFields = () => {
  formRef.value?.reset();
  formRef.value?.resetValidation();
  selectedRole.value = "athlete";
  showPassword.value = false;
  showConfirmPassword.value = false;
};

const submitForm = async () => {
  if (!formRef.value) return;

  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  submitError.value = "";
  submitSuccess.value = "";
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
      submitError.value =
        extractMessage(response.data) || t("admin.register.feedback.failed");
      return;
    }

    submitSuccess.value =
      extractMessage(response.data) || t("admin.register.feedback.success");
    resetFields();
    emit("registered");
  } catch (error: unknown) {
    submitError.value =
      error instanceof Error && error.message
        ? error.message
        : t("admin.register.feedback.unexpectedError");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
