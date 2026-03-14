<template>
  <v-container
    fluid
    class="flex min-h-screen items-center justify-center bg-background px-4 py-5 sm:px-6 sm:py-6"
  >
    <RegisterForm />
  </v-container>
</template>

<script setup lang="ts">
import RegisterForm from '../components/auth/RegisterForm.vue'
</script>
