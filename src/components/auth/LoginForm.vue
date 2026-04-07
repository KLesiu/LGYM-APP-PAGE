<template>
  <div
    class="flex w-full max-w-md flex-col items-center px-4 py-4 text-center text-[rgb(var(--v-theme-on-surface))] sm:px-6 sm:py-6 md:px-8 md:py-8"
  >
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1
          class="text-center text-2xl font-semibold text-[rgb(var(--v-theme-on-surface))]"
        >
          {{ loginTitle }}
        </h1>
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          {{ loginSubtitle }}
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
          <AuthTabs v-if="!isAdminMode" v-model="selectedUserRole" />

          <v-alert
            v-if="submitError"
            type="error"
            variant="tonal"
            density="comfortable"
            :text="submitError"
          />

          <v-alert
            v-if="submitSuccess"
            type="success"
            variant="tonal"
            density="comfortable"
            :text="submitSuccess"
          />

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label
                  for="username"
                  class="text-sm text-[rgb(var(--v-theme-secondary))]"
                  >{{ t("auth.login.fields.username") }}</label
                >
              </div>

              <v-text-field
                id="username"
                v-model="username"
                type="text"
                :placeholder="t('auth.login.placeholders.username')"
                variant="outlined"
                density="compact"
                :rules="usernameRules"
                autocomplete="username"
                base-color="outline"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label
                  for="password"
                  class="text-sm text-[rgb(var(--v-theme-secondary))]"
                  >{{ t("auth.login.fields.password") }}</label
                >
                <button
                  type="button"
                  class="cursor-pointer bg-transparent p-0 text-xs text-[rgb(var(--v-theme-secondary))] underline underline-offset-2"
                >
                  {{ t("auth.login.actions.forgotPassword") }}
                </button>
              </div>

              <v-text-field
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.login.placeholders.password')"
                variant="outlined"
                density="compact"
                :rules="passwordRules"
                autocomplete="current-password"
                :append-inner-icon="
                  showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                base-color="outline"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
                @click:append-inner="togglePassword"
              />
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <v-btn
              block
              variant="flat"
              color="primary"
              height="42"
              type="submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              class="rounded-md! text-sm! font-medium! normal-case! tracking-normal! shadow-none!"
            >
              {{ submitLabel }}
            </v-btn>

            <div class="flex items-center gap-3">
              <div class="h-0.5 flex-1 bg-[rgb(var(--v-theme-outline))]" />
              <span class="text-xs text-[rgb(var(--v-theme-secondary))]">{{
                t("auth.login.actions.orContinueWith")
              }}</span>
              <div class="h-0.5 flex-1 bg-[rgb(var(--v-theme-outline))]" />
            </div>

            <div class="flex flex-col gap-2.5">
              <v-btn
                block
                variant="flat"
                color="primary"
                prepend-icon="mdi-apple"
                height="40"
                class="rounded-md! text-sm! font-medium! normal-case! tracking-normal! shadow-none!"
              >
                {{ t("auth.login.actions.loginWithApple") }}
              </v-btn>
              <v-btn
                block
                variant="flat"
                color="primary"
                prepend-icon="mdi-google"
                height="40"
                class="rounded-md! text-sm! font-medium! normal-case! tracking-normal! shadow-none!"
              >
                {{ t("auth.login.actions.loginWithGoogle") }}
              </v-btn>
            </div>
          </div>
        </v-form>
      </div>

      <div v-if="!isAdminMode" class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          {{ t("auth.login.footer.noAccount") }}
          <router-link
            to="/register"
            class="cursor-pointer bg-transparent p-0 text-[rgb(var(--v-theme-on-surface))] underline underline-offset-2"
          >
            {{ t("auth.login.footer.signUp") }}
          </router-link>
        </p>
      </div>

      <div v-else class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          {{ t("auth.loginAdmin.footer.backToUserLoginLabel") }}
          <router-link
            to="/login"
            class="cursor-pointer bg-transparent p-0 text-[rgb(var(--v-theme-on-surface))] underline underline-offset-2"
          >
            {{ t("auth.loginAdmin.footer.backToUserLogin") }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { postApiLogin, postApiTrainerLogin } from "../../api/generated/demo";
import type { LoginRequest, LoginResponseDto } from "../../api/model";
import logoLgym from "../../assets/logoLGYM.png";
import { saveAuthSession } from "../../composables/useAuthSession";

import AuthTabs from "./AuthTabs.vue";

type AuthRole = "athlete" | "trainer" | "admin";

const props = withDefaults(
  defineProps<{
    mode?: "default" | "admin";
  }>(),
  {
    mode: "default",
  },
);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  reset: () => void;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);

const username = ref("");
const password = ref("");
const selectedRole = ref<AuthRole>(
  props.mode === "admin" ? "admin" : "athlete",
);
const showPassword = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");

const isAdminMode = computed(() => props.mode === "admin");
const selectedUserRole = computed<"athlete" | "trainer">({
  get: () => (selectedRole.value === "trainer" ? "trainer" : "athlete"),
  set: (value) => {
    selectedRole.value = value;
  },
});
const loginTitle = computed(() =>
  isAdminMode.value ? t("auth.loginAdmin.title") : t("auth.login.title"),
);
const loginSubtitle = computed(() =>
  isAdminMode.value ? t("auth.loginAdmin.subtitle") : t("auth.login.subtitle"),
);
const submitLabel = computed(() =>
  isAdminMode.value
    ? t("auth.loginAdmin.actions.submit")
    : t("auth.login.actions.submit"),
);

const usernameRules = [
  (value: string) => !!value || t("auth.validation.usernameRequired"),
  (value: string) => value.length >= 3 || t("auth.validation.usernameMin"),
];

const passwordRules = [
  (value: string) => !!value || t("auth.validation.passwordRequired"),
  (value: string) => value.length >= 6 || t("auth.validation.passwordMin"),
];

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const hasAdminPermissions = (response: LoginResponseDto) => {
  const roles = (response.req?.roles ?? []).map((role) => role.toLowerCase());
  const permissionClaims = (
    response.permissionClaims ??
    response.req?.permissionClaims ??
    []
  ).map((claim) => claim.toLowerCase());

  return (
    roles.includes("admin") ||
    permissionClaims.includes("admin.access") ||
    permissionClaims.includes("users.roles.manage")
  );
};

const loginByRole = async (payload: LoginRequest) => {
  if (selectedRole.value === "trainer") return postApiTrainerLogin(payload);

  return postApiLogin(payload);
};

const performLogin = (response: LoginResponseDto) => {
  const token = response.token ?? "";
  if (!token) return;

  saveAuthSession({
    token,
    role: selectedRole.value,
    roles: response.req?.roles,
    permissionClaims:
      response.permissionClaims ?? response.req?.permissionClaims,
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

  submitError.value = "";
  submitSuccess.value = "";
  isSubmitting.value = true;

  try {
    const payload: LoginRequest = {
      name: username.value,
      password: password.value,
    };

    const response = await loginByRole(payload);

    if (response.status !== 200) {
      submitError.value = t("auth.login.feedback.failed");
      return;
    }

    if (isAdminMode.value && !hasAdminPermissions(response.data)) {
      submitError.value = t("auth.loginAdmin.feedback.accessDenied");
      return;
    }

    performLogin(response.data);
    submitSuccess.value = t("auth.login.feedback.success");
    resetFormValidation();

    if (isAdminMode.value) {
      const redirect =
        typeof route.query.redirect === "string"
          ? route.query.redirect
          : "/admin/users";
      await router.push(redirect);
    }
  } catch (error: unknown) {
    submitError.value =
      error instanceof Error && error.message
        ? error.message
        : t("auth.login.feedback.unexpectedError");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
