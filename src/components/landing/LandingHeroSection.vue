<template>
  <section id="top" class="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
    <div class="landing-noise" />
    <div class="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
      <div class="relative z-10">
        <div class="mb-7 flex items-center gap-3 text-sm font-black uppercase tracking-[0.28em] text-[var(--lgym-primary)]">
          <span class="h-2.5 w-2.5 rounded-full bg-[var(--lgym-primary)] shadow-[0_0_20px_rgba(var(--lgym-primary-rgb),0.9)]" aria-hidden="true" />
          {{ t("landing.hero.badge") }}
        </div>

        <h1 class="max-w-4xl text-5xl font-black tracking-[-0.06em] text-[var(--lgym-text)] sm:text-6xl lg:text-7xl">
          {{ t("landing.hero.title") }}
        </h1>

        <p class="mt-7 max-w-2xl text-lg leading-8 text-[var(--lgym-text-muted)] sm:text-xl">
          {{ t("landing.hero.subtitle") }}
        </p>

        <div class="mt-9 flex flex-col gap-3 sm:flex-row">
          <a class="landing-cta landing-cta--primary" href="#download">
            {{ t("landing.hero.primaryCta") }}
            <span aria-hidden="true">→</span>
          </a>
          <RouterLink class="landing-cta landing-cta--secondary" to="/login">
            {{ t("landing.hero.secondaryCta") }}
          </RouterLink>
        </div>

        <dl class="mt-12 grid max-w-2xl grid-cols-3 gap-3">
          <div v-for="metric in metrics" :key="metric.labelKey" class="landing-metric">
            <dt>{{ t(metric.valueKey) }}</dt>
            <dd>{{ t(metric.labelKey) }}</dd>
          </div>
        </dl>
      </div>

      <div class="relative z-10 min-h-[560px] lg:min-h-[650px]">
        <div class="landing-orbit landing-orbit--one" />
        <div class="landing-orbit landing-orbit--two" />
        <div class="landing-gym-plate landing-gym-plate--top" aria-hidden="true">
          <span />
        </div>
        <div class="landing-gym-plate landing-gym-plate--bottom" aria-hidden="true">
          <span />
        </div>

        <article class="landing-phone landing-phone--primary">
          <div class="landing-phone__slot">
            <img :src="heroScreens[0].image" :alt="heroScreens[0].alt" />
            <span>{{ t("landing.hero.screens.primary.badge") }}</span>
            <strong>{{ t("landing.hero.screens.primary.title") }}</strong>
            <small>{{ t("landing.hero.screens.primary.description") }}</small>
          </div>
        </article>

        <article class="landing-phone landing-phone--secondary">
          <div class="landing-phone__slot">
            <img :src="heroScreens[1].image" :alt="heroScreens[1].alt" />
            <span>{{ t("landing.hero.screens.secondary.badge") }}</span>
            <strong>{{ t("landing.hero.screens.secondary.title") }}</strong>
            <small>{{ t("landing.hero.screens.secondary.description") }}</small>
          </div>
        </article>

        <article class="landing-panel-card">
          <p class="text-xs font-bold uppercase tracking-[0.28em] text-[var(--lgym-primary)]">{{ t("landing.hero.panel.eyebrow") }}</p>
          <h2 class="mt-3 text-2xl font-black tracking-tight">{{ t("landing.hero.panel.title") }}</h2>
          <div class="landing-rep-counter" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div class="mt-5 space-y-3">
            <div v-for="row in panelRows" :key="row" class="landing-panel-row">
              <span />
              {{ t(row) }}
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { heroScreens, metrics, panelRows } from "./landingContent";

const { t } = useI18n();
</script>
