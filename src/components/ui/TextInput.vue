<template>
  <div class="w-full">
    <label v-if="showLabel" :for="id" class="mb-[6px] block text-[13px] text-[#4A4A4A]">
      {{ label }}
    </label>
    <v-text-field
      :id="id"
      :name="name"
      :type="type"
      :model-value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :append-inner-icon="appendInnerIcon"
      :rules="rules"
      variant="outlined"
      density="compact"
      hide-details
      base-color="#E0E0E0"
      color="#111111"
      bg-color="white"
      rounded="lg"
      class="text-input"
      @update:model-value="emit('update:modelValue', $event)"
      @click:append-inner="emit('click:append-inner')"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    placeholder: string
    name?: string
    type?: 'text' | 'email' | 'password'
    autocomplete?: string
    appendInnerIcon?: string
    showLabel?: boolean
    rules?: Array<(value: string) => true | string>
  }>(),
  {
    name: undefined,
    type: 'text',
    autocomplete: 'off',
    appendInnerIcon: undefined,
    showLabel: true,
    rules: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'click:append-inner': []
}>()
</script>

<style scoped>
.text-input :deep(.v-field) {
  min-height: 40px;
}
</style>
