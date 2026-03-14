<template>
  <div class="flex w-full max-w-md flex-col items-center px-4 py-4 text-center text-[rgb(var(--v-theme-on-surface))] sm:px-6 sm:py-6 md:px-8 md:py-8">
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[rgb(var(--v-theme-on-surface))]">Login to your account</h1>
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          Enter your username below to login to your account
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
                <label for="username" class="text-sm text-[rgb(var(--v-theme-secondary))]">Username</label>
              </div>

              <v-text-field
                id="username"
                v-model="username"
                type="text"
                placeholder="your_username"
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
                <label for="password" class="text-sm text-[rgb(var(--v-theme-secondary))]">Password</label>
                <button
                  type="button"
                  class="cursor-pointer bg-transparent p-0 text-xs text-[rgb(var(--v-theme-secondary))] underline underline-offset-2"
                >
                  Forgot your password?
                </button>
              </div>

              <v-text-field
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                variant="outlined"
                density="compact"
                :rules="passwordRules"
                autocomplete="current-password"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
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
              Login
            </v-btn>

            <div class="flex items-center gap-3">
              <div class="h-0.5 flex-1 bg-[rgb(var(--v-theme-outline))]" />
              <span class="text-xs text-[rgb(var(--v-theme-secondary))]">Or continue with</span>
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
                Login with Apple
              </v-btn>
              <v-btn
                block
                variant="flat"
                color="primary"
                prepend-icon="mdi-google"
                height="40"
                class="rounded-md! text-sm! font-medium! normal-case! tracking-normal! shadow-none!"
              >
                Login with Google
              </v-btn>
            </div>
          </div>
        </v-form>
      </div>

      <div class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          Don't have an account?
          <router-link
            to="/register"
            class="cursor-pointer bg-transparent p-0 text-[rgb(var(--v-theme-on-surface))] underline underline-offset-2"
          >
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LoginRequest, LoginResponseDto } from '../../api/model'
import { postApiLogin, postApiTrainerLogin } from '../../api/generated/demo'
import logoLgym from '../../assets/logoLGYM.png'

import AuthTabs from './AuthTabs.vue'

type AuthRole = 'athlete' | 'trainer'

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>
  reset: () => void
  resetValidation: () => void
} | null>(null)
const isFormValid = ref<boolean | null>(null)

const username = ref('')
const password = ref('')
const selectedRole = ref<AuthRole>('athlete')
const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

const usernameRules = [
  (value: string) => !!value || 'Username is required',
  (value: string) => value.length >= 3 || 'Username must be at least 3 characters',
]
const passwordRules = [
  (value: string) => !!value || 'Password is required',
  (value: string) => value.length >= 6 || 'Password must be at least 6 characters',
]

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const loginByRole = async (payload: LoginRequest) => {
  if (selectedRole.value === 'trainer')
    return postApiTrainerLogin(payload)

  return postApiLogin(payload)
}

const performLogin = (response: LoginResponseDto) => {
  const token = response.token ?? ''

  if (token && typeof window !== 'undefined') {
    window.localStorage.setItem('lgym.auth.token', token)
    window.localStorage.setItem('lgym.auth.role', selectedRole.value)
  }

  console.info('Login submit', {
    role: selectedRole.value,
    username: username.value,
    hasPassword: password.value.length > 0,
    hasToken: token.length > 0,
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
    const payload: LoginRequest = {
      name: username.value,
      password: password.value,
    }

    const response = await loginByRole(payload)

    if (response.status !== 200) {
      submitError.value = 'Login failed. Please check your credentials and try again.'
      return
    }

    performLogin(response.data)
    submitSuccess.value = 'Login successful.'
    resetFormValidation()
  }
  catch (error: unknown) {
    submitError.value = error instanceof Error
      ? error.message
      : 'Unexpected login error. Please try again.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
