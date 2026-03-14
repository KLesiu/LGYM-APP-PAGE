<template>
  <v-btn
    :type="type"
    :block="block"
    :variant="variant"
    :prepend-icon="prependIcon"
    :height="height"
    :ripple="true"
    :style="buttonStyle"
    class="primary-btn !normal-case !tracking-normal"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit'
    block?: boolean
    variant?: 'flat' | 'outlined'
    prependIcon?: string
    height?: number
    background?: string
    hoverBackground?: string
    textColor?: string
  }>(),
  {
    type: 'button',
    block: true,
    variant: 'flat',
    prependIcon: undefined,
    height: 42,
    background: '#111111',
    hoverBackground: '#1F1F1F',
    textColor: '#FFFFFF',
  },
)

const buttonStyle = computed(() => ({
  '--btn-bg': props.background,
  '--btn-bg-hover': props.hoverBackground,
  '--btn-color': props.textColor,
  borderColor: props.background,
}))
</script>

<style scoped>
.primary-btn {
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: var(--btn-bg);
  color: var(--btn-color);
  border-color: var(--btn-bg);
}

.primary-btn:hover {
  background: var(--btn-bg-hover);
  border-color: var(--btn-bg-hover);
}

.primary-btn:focus-visible {
  outline: 2px solid #1a1a1a;
  outline-offset: 2px;
}
</style>
