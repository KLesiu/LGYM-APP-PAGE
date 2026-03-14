<template>
  <div class="flex w-full max-w-md flex-col items-center px-4 py-4 text-center text-[rgb(var(--v-theme-on-surface))] sm:px-6 sm:py-6 md:px-8 md:py-8">
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full flex-col items-center gap-2">
        <v-img :src="logoLgym" alt="LGYM logo" width="150" max-width="150" />
        <h1 class="text-center text-2xl font-semibold text-[rgb(var(--v-theme-on-surface))]">Create your account</h1>
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          Fill in your details below to register
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
                <label for="email" class="text-sm text-[rgb(var(--v-theme-secondary))]">Email</label>
              </div>

              <v-text-field
                id="email"
                v-model="email"
                type="email"
                placeholder="me@example.com"
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
                <label for="password" class="text-sm text-[rgb(var(--v-theme-secondary))]">Password</label>
              </div>

              <v-text-field
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
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
                <label for="confirmPassword" class="text-sm text-[rgb(var(--v-theme-secondary))]">Confirm Password</label>
              </div>

              <v-text-field
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm Password"
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
            Register
          </v-btn>
        </v-form>
      </div>

      <div class="flex flex-col items-center gap-1">
        <p class="text-center text-sm text-[rgb(var(--v-theme-secondary))]">
          Already have an account?
          <router-link
            to="/login"
            class="cursor-pointer bg-transparent p-0 text-[rgb(var(--v-theme-on-surface))] underline underline-offset-2"
          >
            Login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { RegisterUserRequest, ResponseMessageDto } from '../../api/model'
import { postApiRegister, postApiTrainerRegister } from '../../api/generated/demo'
import logoLgym from '../../assets/logoLGYM.png'

import AuthTabs from './AuthTabs.vue'

type AuthRole = 'athlete' | 'trainer'

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
  (value: string) => !!value || 'Username is required',
  (value: string) => value.length >= 3 || 'Username must be at least 3 characters',
]
const emailRules = [
  (value: string) => !!value || 'Email is required',
  (value: string) => /.+@.+\..+/.test(value) || 'Email must be valid',
]
const passwordRules = [
  (value: string) => !!value || 'Password is required',
  (value: string) => value.length >= 6 || 'Password must be at least 6 characters',
]
const confirmPasswordRules = [
  (value: string) => !!value || 'Confirm password is required',
  (value: string) => value === password.value || 'Passwords must match',
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
      submitError.value = extractMessage(response.data) || 'Registration failed. Please try again.'
      return
    }

    performRegister(response.data)
    submitSuccess.value = extractMessage(response.data) || 'Registration successful. You can log in now.'
    resetFormValidation()
    await router.push('/login')
  }
  catch (error: unknown) {
    submitError.value = error instanceof Error
      ? error.message
      : 'Unexpected registration error. Please try again.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
