<template>
  <section class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
      <article v-for="audience in audiences" :key="audience" class="landing-audience-card">
        <p>{{ t(`landing.audiences.items.${audience}.kicker`) }}</p>
        <h3>{{ t(`landing.audiences.items.${audience}.title`) }}</h3>
        <span>{{ t(`landing.audiences.items.${audience}.copy`) }}</span>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { audiences } from "./landingContent";

const { t } = useI18n();
</script>
