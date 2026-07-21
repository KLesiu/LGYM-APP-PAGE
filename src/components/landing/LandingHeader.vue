<template>
  <header class="landing-header px-4 py-6 sm:px-6 lg:px-8">
    <div class="landing-header__inner mx-auto flex max-w-7xl items-center justify-between gap-5">
      <a
        class="landing-header__brand flex items-center gap-3"
        href="#top"
        aria-label="Training Hub — strona główna"
      >
        <img src="/training-hub-mark.svg" alt="Training Hub" />
        <span class="text-base font-semibold tracking-tight text-[var(--lgym-text)] sm:text-lg">
          Training Hub
        </span>
      </a>

      <nav class="landing-header__nav" :aria-label="t('landing.nav.ariaLabel')">
        <a href="#athletes">{{ t("landing.nav.athletes") }}</a>
        <a href="#trainers">{{ t("landing.nav.trainers") }}</a>
        <a href="#socials">{{ t("landing.nav.socials") }}</a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
