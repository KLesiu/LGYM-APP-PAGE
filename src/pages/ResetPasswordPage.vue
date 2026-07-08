<template>
  <v-container
    fluid
    class="flex min-h-screen items-center justify-center bg-[var(--lgym-page-glow),var(--lgym-bg)] px-4 py-5 sm:px-6 sm:py-6"
  >
    <ResetPasswordForm />
  </v-container>
</template>

<script setup lang="ts">
import ResetPasswordForm from "../components/auth/ResetPasswordForm.vue";
</script>
