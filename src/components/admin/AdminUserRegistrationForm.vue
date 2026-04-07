<template>
  <v-card
    rounded="[32px]"
    class="register-panel overflow-hidden border border-[rgb(var(--v-theme-outline))] bg-surface/95"
  >
    <div class="register-panel__top px-5 py-5 sm:px-6">
      <p
        class="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--v-theme-primary))]"
      >
        {{ t("admin.register.eyebrow") }}
      </p>
      <h2 class="mt-3 text-2xl font-semibold text-white">
        {{ t("admin.register.title") }}
      </h2>
      <p class="mt-2 max-w-md text-sm leading-6 text-white/72">
        {{ t("admin.register.subtitle") }}
      </p>
      <p
        class="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-white/45"
      >
        {{ t("admin.register.scope") }}
      </p>
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
          class="rounded-[22px] border border-[rgb(var(--v-theme-outline))] bg-[rgb(var(--v-theme-surface-variant))]/55 p-2"
        >
          <AuthTabs v-model="selectedRole" />
        </div>

        <v-alert
          v-if="submitError"
          type="error"
          variant="tonal"
          density="comfortable"
          border="start"
          class="rounded-2xl"
          :text="submitError"
        />

        <v-alert
          v-if="submitSuccess"
          type="success"
          variant="tonal"
          density="comfortable"
          border="start"
          class="rounded-2xl"
          :text="submitSuccess"
        />

        <div class="grid gap-4">
          <v-text-field
            v-model="username"
            :label="t('auth.register.fields.username')"
            :placeholder="t('auth.register.placeholders.username')"
            variant="outlined"
            density="comfortable"
            :rules="usernameRules"
            autocomplete="username"
            base-color="outline"
            color="primary"
            bg-color="surface"
            rounded="xl"
            hide-details="auto"
          />

          <v-text-field
            v-model="email"
            type="email"
            :label="t('auth.register.fields.email')"
            :placeholder="t('auth.register.placeholders.email')"
            variant="outlined"
            density="comfortable"
            :rules="emailRules"
            autocomplete="email"
            base-color="outline"
            color="primary"
            bg-color="surface"
            rounded="xl"
            hide-details="auto"
          />

          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :label="t('auth.register.fields.password')"
            :placeholder="t('auth.register.placeholders.password')"
            variant="outlined"
            density="comfortable"
            :rules="passwordRules"
            autocomplete="new-password"
            :append-inner-icon="
              showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
            "
            base-color="outline"
            color="primary"
            bg-color="surface"
            rounded="xl"
            hide-details="auto"
            @click:append-inner="togglePassword"
          />

          <v-text-field
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :label="t('auth.register.fields.confirmPassword')"
            :placeholder="t('auth.register.placeholders.confirmPassword')"
            variant="outlined"
            density="comfortable"
            :rules="confirmPasswordRules"
            autocomplete="new-password"
            :append-inner-icon="
              showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
            "
            base-color="outline"
            color="primary"
            bg-color="surface"
            rounded="xl"
            hide-details="auto"
            @click:append-inner="toggleConfirmPassword"
          />
        </div>

        <div
          class="rounded-[24px] border border-[rgb(var(--v-theme-outline))] bg-[rgb(var(--v-theme-surface-variant))]/35 p-4"
        >
          <div class="flex items-start gap-3">
            <div class="register-panel__icon">
              <v-icon icon="mdi-account-plus-outline" size="22" />
            </div>
            <p class="text-sm leading-6 text-[rgb(var(--v-theme-secondary))]">
              {{ t("admin.register.note") }}
            </p>
          </div>
        </div>

        <v-btn
          type="submit"
          variant="flat"
          color="primary"
          rounded="xl"
          size="large"
          class="register-submit"
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

<style scoped>
.register-panel {
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.register-panel__top {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(145deg, rgba(12, 18, 34, 0.96), rgba(27, 40, 68, 0.88)),
    #0b1220;
}

.register-panel__top::after {
  content: "";
  position: absolute;
  inset: auto -40px -80px auto;
  height: 180px;
  width: 180px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(56, 189, 248, 0.22),
    transparent 68%
  );
}

.register-panel__icon {
  display: inline-flex;
  height: 44px;
  width: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
}

.register-submit {
  min-height: 48px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}
</style>
