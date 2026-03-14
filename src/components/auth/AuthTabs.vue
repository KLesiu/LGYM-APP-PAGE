<template>
  <div class="flex h-9 w-full gap-1.5 rounded-lg bg-[rgb(var(--v-theme-surface-variant))] p-1">
    <v-btn
      variant="flat"
      :class="tabClass('athlete')"
      @click="updateRole('athlete')"
    >
      Athlete Panel
    </v-btn>

    <v-btn
      variant="flat"
      :class="tabClass('trainer')"
      @click="updateRole('trainer')"
    >
      Trainer Zone
    </v-btn>
  </div>
</template>

<script setup lang="ts">
type AuthRole = 'athlete' | 'trainer'

const props = defineProps<{
  modelValue: AuthRole
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AuthRole]
}>()

const updateRole = (value: AuthRole) => {
  emit('update:modelValue', value)
}

const tabClass = (role: AuthRole) => [
  'flex-1 h-full! min-w-0! rounded-md! normal-case! text-sm! font-medium! tracking-normal! shadow-none!',
  props.modelValue === role
    ? 'bg-[rgb(var(--v-theme-surface))]! text-[rgb(var(--v-theme-on-surface))]!'
    : 'bg-transparent! text-[rgb(var(--v-theme-secondary))]!',
]
</script>
