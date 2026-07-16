<template>
  <section class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
      <div class="landing-section-card">
        <p class="landing-eyebrow">{{ t("landing.context.eyebrow") }}</p>
        <h2>{{ t("landing.context.title") }}</h2>
        <p>{{ t("landing.context.description") }}</p>
      </div>

      <div class="landing-showcase" :aria-label="t('landing.showcase.ariaLabel')">
        <div class="landing-showcase__stage">
          <div class="landing-showcase__pulse" aria-hidden="true" />
          <article class="landing-showcase-phone">
            <img :src="eloShowcase.image" :alt="t(eloShowcase.titleKey)" />
          </article>
        </div>

        <div class="landing-showcase__content">
          <p class="landing-eyebrow">{{ t(eloShowcase.kickerKey) }}</p>
          <h3>{{ t(eloShowcase.titleKey) }}</h3>
          <p>{{ t(eloShowcase.descriptionKey) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { eloShowcase } from "./landingContent";

const { t } = useI18n();
</script>
