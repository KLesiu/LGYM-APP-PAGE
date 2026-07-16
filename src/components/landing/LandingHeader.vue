<template>
  <header class="landing-header px-4 py-6 sm:px-6 lg:px-8">
    <div class="landing-header__inner mx-auto flex max-w-7xl items-center justify-between gap-5">
      <a class="landing-header__brand" href="#top" aria-label="LGYM home">
        <img :src="logoSrc" alt="LGYM" />
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
import logoSrc from "../../assets/logoLGYM.png";

const { t } = useI18n();
</script>
