<template>
  <div
    class="flex w-full max-w-md flex-col items-center px-5 py-5 text-center text-[var(--lgym-text)] sm:px-6 sm:py-6"
  >
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[var(--lgym-text)]">
          {{ loginTitle }}
        </h1>
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
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

          <div class="grid gap-4">
            <v-text-field
              id="username"
              v-model="username"
              type="text"
              :label="t('auth.login.fields.username')"
              :placeholder="t('auth.login.placeholders.username')"
              :rules="usernameRules"
              autocomplete="username"
            />

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-end">
                <router-link
                  to="/forgot-password"
                  class="text-xs text-[var(--lgym-text-muted)] underline underline-offset-2 hover:text-[var(--lgym-text)]"
                >
                  {{ t("auth.login.actions.forgotPassword") }}
                </router-link>
              </div>

              <v-text-field
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :label="t('auth.login.fields.password')"
                :placeholder="t('auth.login.placeholders.password')"
                :rules="passwordRules"
                autocomplete="current-password"
                :append-inner-icon="
                  showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                @click:append-inner="togglePassword"
              />
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <v-btn
              block
              color="primary"
              type="submit"
              size="large"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ submitLabel }}
            </v-btn>

            <div class="flex items-center gap-3">
              <div class="h-0.5 flex-1 bg-[var(--lgym-border)]" />
              <span class="text-xs text-[var(--lgym-text-muted)]">{{
                t("auth.login.actions.orContinueWith")
              }}</span>
              <div class="h-0.5 flex-1 bg-[var(--lgym-border)]" />
            </div>

            <div class="flex flex-col gap-2.5">
              <v-btn
                block
                variant="outlined"
                color="primary"
                prepend-icon="mdi-apple"
                size="large"
              >
                {{ t("auth.login.actions.loginWithApple") }}
              </v-btn>
              <v-btn
                block
                variant="outlined"
                color="primary"
                prepend-icon="mdi-google"
                size="large"
              >
                {{ t("auth.login.actions.loginWithGoogle") }}
              </v-btn>
            </div>
          </div>
        </v-form>
      </div>

      <div v-if="!isAdminMode" class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.login.footer.noAccount") }}
          <router-link
            to="/register"
            class="text-[var(--lgym-text)] underline underline-offset-2 hover:text-[var(--lgym-primary)]"
          >
            {{ t("auth.login.footer.signUp") }}
          </router-link>
        </p>
      </div>

      <div v-else class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("auth.loginAdmin.footer.backToUserLoginLabel") }}
          <router-link
            to="/login"
            class="text-[var(--lgym-text)] underline underline-offset-2 hover:text-[var(--lgym-primary)]"
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
import { useToast } from "../../composables/useToast";

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
const toast = useToast();
const router = useRouter();
const route = useRoute();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  reset: () => void;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);

const resolveInitialRole = (): AuthRole => {
  if (props.mode === "admin") return "admin";

  const redirect =
    typeof route.query.redirect === "string" ? route.query.redirect : "";

  if (redirect.startsWith("/trainer")) return "trainer";

  return "athlete";
};

const username = ref("");
const password = ref("");
const selectedRole = ref<AuthRole>(resolveInitialRole());
const showPassword = ref(false);
const isSubmitting = ref(false);

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

  isSubmitting.value = true;

  try {
    const payload: LoginRequest = {
      name: username.value,
      password: password.value,
    };

    const response = await loginByRole(payload);

    if (response.status !== 200) {
      toast.error("auth.login.feedback.failed");
      return;
    }

    if (isAdminMode.value && !hasAdminPermissions(response.data)) {
      toast.error("auth.loginAdmin.feedback.accessDenied");
      return;
    }

    performLogin(response.data);
    toast.success("auth.login.feedback.success");
    resetFormValidation();

    if (isAdminMode.value) {
      const redirect =
        typeof route.query.redirect === "string"
          ? route.query.redirect
          : "/admin/users";
      await router.push(redirect);
      return;
    }

    if (selectedRole.value === "trainer") {
      const redirect =
        typeof route.query.redirect === "string"
          ? route.query.redirect
          : "/trainer/invitations";
      await router.push(redirect);
    }
  } catch (error: unknown) {
    console.error(error);
    toast.error("auth.login.feedback.unexpectedError");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
