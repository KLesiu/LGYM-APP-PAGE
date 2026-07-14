<template>
  <section id="download" class="px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28">
    <div class="landing-final-cta mx-auto max-w-7xl">
      <div>
        <p class="landing-eyebrow">{{ t("landing.download.eyebrow") }}</p>
        <h2>{{ t("landing.download.title") }}</h2>
        <p>{{ t("landing.download.description") }}</p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <a class="landing-store-button" href="#download" :aria-label="t('landing.download.appStoreAria')">
          <span>{{ t("landing.download.appStorePrefix") }}</span>
          App Store
        </a>
        <a class="landing-store-button" href="#download" :aria-label="t('landing.download.googlePlayAria')">
          <span>{{ t("landing.download.googlePlayPrefix") }}</span>
          Google Play
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
