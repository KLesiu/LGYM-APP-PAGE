<template>
  <div class="flex w-full max-w-md flex-col items-center px-4 py-4 text-center text-[rgb(var(--v-theme-on-surface))] sm:px-6 sm:py-6 md:px-8 md:py-8">
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[rgb(var(--v-theme-on-surface))]">{{ t('auth.register.title') }}</h1>
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          {{ t('auth.register.subtitle') }}
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
                <label for="username" class="text-sm text-[rgb(var(--v-theme-secondary))]">{{ t('auth.register.fields.username') }}</label>
              </div>

              <v-text-field
                id="username"
                v-model="username"
                type="text"
                :placeholder="t('auth.register.placeholders.username')"
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
                <label for="email" class="text-sm text-[rgb(var(--v-theme-secondary))]">{{ t('auth.register.fields.email') }}</label>
              </div>

              <v-text-field
                id="email"
                v-model="email"
                type="email"
                :placeholder="t('auth.register.placeholders.email')"
                variant="outlined"
                density="compact"
                :rules="emailRules"
                autocomplete="email"
                base-color="outline"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label for="password" class="text-sm text-[rgb(var(--v-theme-secondary))]">{{ t('auth.register.fields.password') }}</label>
              </div>

              <v-text-field
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.register.placeholders.password')"
                variant="outlined"
                density="compact"
                :rules="passwordRules"
                autocomplete="new-password"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                base-color="outline"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
                @click:append-inner="togglePassword"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label for="confirmPassword" class="text-sm text-[rgb(var(--v-theme-secondary))]">{{ t('auth.register.fields.confirmPassword') }}</label>
              </div>

              <v-text-field
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :placeholder="t('auth.register.placeholders.confirmPassword')"
                variant="outlined"
                density="compact"
                :rules="confirmPasswordRules"
                autocomplete="new-password"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                base-color="outline"
                color="primary"
                bg-color="surface"
                rounded="lg"
                hide-details="auto"
                @click:append-inner="toggleConfirmPassword"
              />
            </div>
          </div>

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
            {{ t('auth.register.actions.submit') }}
          </v-btn>
        </v-form>
      </div>

      <div class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          {{ t('auth.register.footer.haveAccount') }}
          <router-link
            to="/login"
            class="cursor-pointer bg-transparent p-0 text-[rgb(var(--v-theme-on-surface))] underline underline-offset-2"
          >
            {{ t('auth.register.footer.login') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { RegisterUserRequest, ResponseMessageDto } from '../../api/model'
import { postApiRegister, postApiTrainerRegister } from '../../api/generated/demo'
import logoLgym from '../../assets/logoLGYM.png'

import AuthTabs from './AuthTabs.vue'

type AuthRole = 'athlete' | 'trainer'

const { t } = useI18n()

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>
  reset: () => void
  resetValidation: () => void
} | null>(null)
const isFormValid = ref<boolean | null>(null)
const router = useRouter()

const selectedRole = ref<AuthRole>('athlete')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

const usernameRules = [
  (value: string) => !!value || t('auth.validation.usernameRequired'),
  (value: string) => value.length >= 3 || t('auth.validation.usernameMin'),
]
const emailRules = [
  (value: string) => !!value || t('auth.validation.emailRequired'),
  (value: string) => /.+@.+\..+/.test(value) || t('auth.validation.emailInvalid'),
]
const passwordRules = [
  (value: string) => !!value || t('auth.validation.passwordRequired'),
  (value: string) => value.length >= 6 || t('auth.validation.passwordMin'),
]
const confirmPasswordRules = [
  (value: string) => !!value || t('auth.validation.confirmPasswordRequired'),
  (value: string) => value === password.value || t('auth.validation.passwordsMustMatch'),
]

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const registerByRole = async (payload: RegisterUserRequest) => {
  if (selectedRole.value === 'trainer')
    return postApiTrainerRegister(payload)

  return postApiRegister(payload)
}

const extractMessage = (data: ResponseMessageDto | null | undefined) => {
  if (!data)
    return ''

  return data.msg ?? ''
}

const performRegister = (response: ResponseMessageDto) => {
  console.info('Register submit', {
    role: selectedRole.value,
    username: username.value,
    email: email.value,
    hasPassword: password.value.length > 0,
    passwordsMatch: confirmPassword.value === password.value,
    responseMessage: response.msg ?? '',
  })
}

const resetForm = () => {
  formRef.value?.reset()
}

const resetFormValidation = () => {
  formRef.value?.resetValidation()
}

defineExpose({
  resetForm,
  resetFormValidation,
})

const submitForm = async () => {
  if (!formRef.value)
    return

  const validation = await formRef.value.validate()
  if (!validation.valid)
    return

  submitError.value = ''
  submitSuccess.value = ''
  isSubmitting.value = true

  try {
    const payload: RegisterUserRequest = {
      name: username.value,
      email: email.value,
      password: password.value,
      cpassword: confirmPassword.value,
      isVisibleInRanking: true,
    }

    const response = await registerByRole(payload)

    if (response.status !== 200) {
      submitError.value = extractMessage(response.data) || t('auth.register.feedback.failed')
      return
    }

    performRegister(response.data)
    submitSuccess.value = extractMessage(response.data) || t('auth.register.feedback.success')
    resetFormValidation()
    await router.push('/login')
  }
  catch (error: unknown) {
    submitError.value = error instanceof Error && error.message
      ? error.message
      : t('auth.register.feedback.unexpectedError')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
