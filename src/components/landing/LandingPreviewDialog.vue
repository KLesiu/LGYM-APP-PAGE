<template>
  <div class="landing-preview" role="dialog" aria-modal="true" :aria-label="t(screen.titleKey)" @click.self="emit('close')">
    <button type="button" class="landing-preview__close" :aria-label="t('common.actions.dismiss')" @click="emit('close')">×</button>
    <figure class="landing-preview__figure" :class="{ 'landing-preview__figure--wide': screen.previewLayout === 'wide' }">
      <img :src="screen.image" :alt="t(screen.titleKey)" />
      <figcaption>
        <span>{{ t(screen.kickerKey) }}</span>
        <strong>{{ t(screen.titleKey) }}</strong>
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { PreviewScreen } from "./types";

defineProps<{
  screen: PreviewScreen;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
</script>
