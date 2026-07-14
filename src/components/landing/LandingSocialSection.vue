<template>
  <section id="socials" class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="landing-social-card mx-auto max-w-7xl" :class="{ 'landing-social-card--dark': isDark }">
      <div>
        <p class="landing-eyebrow">{{ t("landing.socials.eyebrow") }}</p>
        <h2>{{ t("landing.socials.title") }}</h2>
        <p>{{ t("landing.socials.description") }}</p>
      </div>
      <div class="landing-social-links">
        <a v-for="social in socialLinks" :key="social.labelKey" :href="social.href" target="_blank" rel="noreferrer">
          <i :class="social.icon" aria-hidden="true" />
          <span>
            <strong>{{ t(social.labelKey) }}</strong>
            <small>{{ t(social.descriptionKey) }}</small>
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { socialLinks } from "./landingContent";

defineProps<{
  isDark: boolean;
}>();

const { t } = useI18n();
</script>
