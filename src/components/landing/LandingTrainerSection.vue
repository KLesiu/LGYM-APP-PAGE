<template>
  <section id="trainers" class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="landing-product-section landing-product-section--trainer mx-auto max-w-7xl" :class="{ 'landing-product-section--trainer-dark': isDark }">
      <div class="landing-product-section__copy">
        <p class="landing-eyebrow">{{ t("landing.productSections.trainers.eyebrow") }}</p>
        <h2>{{ t("landing.productSections.trainers.title") }}</h2>
        <p>{{ t("landing.productSections.trainers.description") }}</p>
      </div>

      <div class="landing-screen-grid landing-screen-grid--trainer">
        <button
          v-for="screen in screens"
          :key="screen.titleKey"
          type="button"
          class="landing-screen-card landing-screen-card--trainer"
          @click="emit('preview', screen)"
        >
          <div class="landing-trainer-screen-slot">
            <div class="landing-trainer-screen-slot__bar">
              <span />
              <span />
              <span />
            </div>
            <div class="landing-trainer-screen-slot__body">
              <img :src="screen.image" :alt="t(screen.titleKey)" />
            </div>
          </div>
          <div class="landing-screen-card__copy">
            <span>{{ t(screen.kickerKey) }}</span>
            <strong>{{ t(screen.titleKey) }}</strong>
            <p>{{ t(screen.descriptionKey) }}</p>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { trainerScreenSlotSources } from "./landingContent";
import type { PreviewScreen } from "./types";

const props = defineProps<{
  isDark: boolean;
}>();

const emit = defineEmits<{
  preview: [screen: PreviewScreen];
}>();

const { t } = useI18n();

const screens = computed(() =>
  trainerScreenSlotSources.map((screen) => ({
    ...screen,
    image: props.isDark ? screen.darkImage : screen.lightImage,
    previewLayout: "wide" as const,
  })),
);
</script>
