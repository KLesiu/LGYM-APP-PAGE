<template>
  <section id="features" class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="max-w-3xl">
        <p class="landing-eyebrow">{{ t("landing.features.eyebrow") }}</p>
        <h2 class="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
          {{ t("landing.features.title") }}
        </h2>
      </div>

      <div class="mt-10 grid gap-4 md:grid-cols-3">
        <article v-for="feature in features" :key="feature.key" class="landing-feature-card">
          <div class="landing-feature-card__icon">{{ feature.icon }}</div>
          <h3>{{ t(`landing.features.items.${feature.key}.title`) }}</h3>
          <p>{{ t(`landing.features.items.${feature.key}.description`) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { features } from "./landingContent";

const { t } = useI18n();
</script>
