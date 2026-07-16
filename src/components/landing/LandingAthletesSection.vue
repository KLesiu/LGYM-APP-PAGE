<template>
  <section id="athletes" class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="landing-product-section landing-product-section--athlete mx-auto max-w-7xl">
      <div class="landing-product-section__copy">
        <p class="landing-eyebrow">{{ t("landing.productSections.athletes.eyebrow") }}</p>
        <h2>{{ t("landing.productSections.athletes.title") }}</h2>
        <p>{{ t("landing.productSections.athletes.description") }}</p>
      </div>

      <div class="landing-screen-grid landing-screen-grid--mobile">
        <button
          v-for="screen in athleteScreens"
          :key="screen.titleKey"
          type="button"
          class="landing-screen-card landing-screen-card--mobile"
          @click="emit('preview', screen)"
        >
          <img :src="screen.image" :alt="t(screen.titleKey)" />
          <div>
            <span>{{ t(screen.kickerKey) }}</span>
            <strong>{{ t(screen.titleKey) }}</strong>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { athleteScreens } from "./landingContent";
import type { PreviewScreen } from "./types";

const emit = defineEmits<{
  preview: [screen: PreviewScreen];
}>();

const { t } = useI18n();
</script>
