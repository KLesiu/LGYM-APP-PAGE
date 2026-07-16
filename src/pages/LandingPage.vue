<template>
  <main class="landing-page min-h-screen bg-[var(--lgym-bg)] text-[var(--lgym-text)]">
    <LandingHeader />
    <LandingHeroSection />
    <LandingFeaturesSection />
    <LandingContextShowcaseSection />
    <LandingAthletesSection @preview="openScreenPreview" />
    <LandingPreviewDialog v-if="selectedScreen" :screen="selectedScreen" @close="closeScreenPreview" />
    <LandingTrainerSection :is-dark="isDark" @preview="openScreenPreview" />
    <LandingAudienceSection />
    <LandingSocialSection :is-dark="isDark" />
    <LandingDownloadSection />
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import LandingAthletesSection from "../components/landing/LandingAthletesSection.vue";
import LandingAudienceSection from "../components/landing/LandingAudienceSection.vue";
import LandingContextShowcaseSection from "../components/landing/LandingContextShowcaseSection.vue";
import LandingDownloadSection from "../components/landing/LandingDownloadSection.vue";
import LandingFeaturesSection from "../components/landing/LandingFeaturesSection.vue";
import LandingHeader from "../components/landing/LandingHeader.vue";
import LandingHeroSection from "../components/landing/LandingHeroSection.vue";
import LandingPreviewDialog from "../components/landing/LandingPreviewDialog.vue";
import LandingSocialSection from "../components/landing/LandingSocialSection.vue";
import LandingTrainerSection from "../components/landing/LandingTrainerSection.vue";
import { useAppTheme } from "../composables/useAppTheme";
import type { PreviewScreen } from "../components/landing/types";

const { isDark } = useAppTheme();
const selectedScreen = ref<PreviewScreen | null>(null);

function openScreenPreview(screen: PreviewScreen) {
  selectedScreen.value = screen;
}

function closeScreenPreview() {
  selectedScreen.value = null;
}

function handlePreviewKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeScreenPreview();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handlePreviewKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handlePreviewKeydown);
});
</script>

<style>
.landing-page {
  position: relative;
  isolation: isolate;
  overflow-x: clip;
  background:
    radial-gradient(circle at 12% 12%, rgba(var(--lgym-primary-rgb), 0.28), transparent 28rem),
    radial-gradient(circle at 86% 4%, rgba(var(--lgym-primary-rgb), 0.14), transparent 22rem),
    var(--lgym-bg);
}

html:has(.landing-page),
body:has(.landing-page),
#app:has(.landing-page) {
  height: auto;
  min-height: 100%;
}

html:has(.landing-page) {
  overflow-y: auto;
}

body:has(.landing-page) {
  overflow-y: visible;
}

.landing-page::before {
  content: "";
  pointer-events: none;
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    radial-gradient(circle at 18% 20%, rgba(var(--lgym-primary-rgb), 0.28), transparent 20rem),
    radial-gradient(circle at 78% 18%, rgba(var(--lgym-primary-rgb), 0.16), transparent 18rem),
    radial-gradient(circle at 18% 72%, rgba(var(--lgym-primary-rgb), 0.18), transparent 24rem),
    radial-gradient(circle at 84% 76%, rgba(var(--lgym-primary-rgb), 0.2), transparent 26rem),
    linear-gradient(118deg, transparent 0 18%, rgba(var(--lgym-primary-rgb), 0.08) 18.2% 18.8%, transparent 19% 48%, rgba(var(--lgym-primary-rgb), 0.08) 48.2% 48.8%, transparent 49%),
    repeating-radial-gradient(circle at 12% 28%, rgba(var(--lgym-primary-rgb), 0.16) 0 0.12rem, transparent 0.16rem 4.8rem),
    repeating-linear-gradient(90deg, transparent 0 5.5rem, rgba(var(--lgym-primary-rgb), 0.075) 5.55rem 5.65rem, transparent 5.7rem 11rem);
  opacity: 0.96;
}

.landing-page::after {
  content: "";
  pointer-events: none;
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    radial-gradient(circle at 9% 34%, transparent 0 2.1rem, rgba(var(--lgym-primary-rgb), 0.18) 2.18rem 2.28rem, transparent 2.36rem 5.4rem, rgba(var(--lgym-primary-rgb), 0.12) 5.48rem 5.58rem, transparent 5.66rem),
    radial-gradient(circle at 93% 44%, transparent 0 1.8rem, rgba(var(--lgym-primary-rgb), 0.18) 1.88rem 2rem, transparent 2.08rem 4.8rem, rgba(var(--lgym-primary-rgb), 0.11) 4.9rem 5rem, transparent 5.08rem),
    linear-gradient(90deg, transparent 0 7%, rgba(var(--lgym-primary-rgb), 0.16) 7.1% 7.45%, transparent 7.55% 92.5%, rgba(var(--lgym-primary-rgb), 0.16) 92.6% 92.95%, transparent 93.05% 100%);
  opacity: 0.72;
  mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
}

.landing-page *,
.landing-page *::before,
.landing-page *::after {
  min-width: 0;
}

.landing-noise {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image: linear-gradient(rgba(var(--lgym-primary-rgb), 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--lgym-primary-rgb), 0.08) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}

.landing-noise::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 0 42%, rgba(255, 255, 255, 0.22) 48%, transparent 56% 100%);
  opacity: 0.22;
  transform: translateX(-120%);
  animation: landing-sweep 8s ease-in-out infinite;
}

.landing-header {
  position: relative;
  z-index: 20;
}

.landing-header__inner {
  flex-wrap: wrap;
}

.landing-header__brand {
  display: inline-flex;
  align-items: center;
}

.landing-header__brand img {
  width: clamp(4.5rem, 10vw, 6.75rem);
  height: auto;
  object-fit: contain;
}

.landing-header__nav {
  display: none;
  align-items: center;
  gap: 0.55rem;
}

.landing-header__nav a {
  border-radius: 999px;
  padding: 0.7rem 0.95rem;
  color: var(--lgym-text-muted);
  font-size: 0.85rem;
  font-weight: 850;
  transition:
    color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.landing-header__nav a:hover {
  background: rgba(var(--lgym-primary-rgb), 0.1);
  color: var(--lgym-text);
  transform: translateY(-1px);
}

.landing-cta,
.landing-store-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 800;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.landing-cta {
  min-height: 3.35rem;
  gap: 0.6rem;
  padding: 0.95rem 1.35rem;
}

.landing-cta:hover,
.landing-store-button:hover,
.landing-feature-card:hover,
.landing-audience-card:hover {
  transform: translateY(-3px);
}

.landing-cta:active,
.landing-store-button:active {
  transform: translateY(-1px) scale(0.98);
}

.landing-cta--primary {
  position: relative;
  overflow: hidden;
  background: var(--lgym-primary);
  color: white;
  box-shadow: 0 24px 70px rgba(var(--lgym-primary-rgb), 0.34);
}

.landing-cta--primary::after,
.landing-store-button::after {
  content: "";
  position: absolute;
  inset: -45% auto -45% -35%;
  width: 32%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
  transform: rotate(14deg) translateX(-160%);
  transition: transform 560ms ease;
}

.landing-cta--primary:hover::after,
.landing-store-button:hover::after {
  transform: rotate(14deg) translateX(520%);
}

.landing-cta--secondary {
  border: 1px solid var(--lgym-border-strong);
  background: var(--lgym-surface-card);
  color: var(--lgym-text);
}

.landing-metric,
.landing-feature-card,
.landing-section-card,
.landing-audience-card,
.landing-final-cta {
  border: 1px solid var(--lgym-border);
  background: color-mix(in srgb, var(--lgym-surface-card) 88%, transparent);
  backdrop-filter: blur(18px);
}

.landing-metric {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  padding: 1rem;
}

.landing-metric::after {
  content: "";
  position: absolute;
  inset: auto 1rem 0.75rem;
  height: 0.18rem;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--lgym-primary), transparent);
  opacity: 0.42;
  transform-origin: left;
  animation: landing-rep-line 2.8s ease-in-out infinite;
}

.landing-metric:nth-child(2)::after {
  animation-delay: 420ms;
}

.landing-metric:nth-child(3)::after {
  animation-delay: 840ms;
}

.landing-metric dt {
  color: var(--lgym-text);
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 950;
  line-height: 1;
}

.landing-metric dd {
  margin-top: 0.35rem;
  color: var(--lgym-text-soft);
  font-size: 0.8rem;
  font-weight: 700;
}

.landing-orbit {
  position: absolute;
  border-radius: 9999px;
  filter: blur(2px);
}

.landing-orbit--one {
  inset: 2rem 4rem auto auto;
  width: 19rem;
  height: 19rem;
  border: 1px solid rgba(var(--lgym-primary-rgb), 0.35);
  animation: landing-orbit-drift 11s ease-in-out infinite alternate;
}

.landing-orbit--two {
  bottom: 2rem;
  left: 1rem;
  width: 26rem;
  height: 26rem;
  border: 1px dashed rgba(var(--lgym-primary-rgb), 0.3);
  animation: landing-orbit-drift 14s ease-in-out infinite alternate-reverse;
}

.landing-gym-plate {
  position: absolute;
  z-index: 0;
  display: grid;
  width: clamp(4.5rem, 10vw, 7.25rem);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(var(--lgym-primary-rgb), 0.28);
  border-radius: 999px;
  background:
    radial-gradient(circle, transparent 0 22%, rgba(var(--lgym-primary-rgb), 0.18) 23% 32%, transparent 33%),
    repeating-conic-gradient(from 18deg, rgba(var(--lgym-primary-rgb), 0.22) 0 10deg, transparent 10deg 24deg);
  opacity: 0.72;
  filter: blur(0.1px);
  animation: landing-plate-spin 20s linear infinite;
}

.landing-gym-plate span {
  width: 34%;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(var(--lgym-primary-rgb), 0.36);
  background: color-mix(in srgb, var(--lgym-surface-card) 72%, transparent);
}

.landing-gym-plate--top {
  top: 4rem;
  right: 0.5rem;
}

.landing-gym-plate--bottom {
  bottom: 6.5rem;
  left: 2.25rem;
  animation-direction: reverse;
  animation-duration: 24s;
}

.landing-phone {
  position: absolute;
  width: min(58vw, 17.5rem);
  min-height: 34rem;
  border: 0.75rem solid #111;
  border-radius: 2.5rem;
  background: linear-gradient(155deg, #171717, #050505);
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.32);
  animation: landing-phone-float 7s ease-in-out infinite;
}

.landing-phone--primary {
  right: 12%;
  top: 0;
  transform: rotate(5deg);
}

.landing-phone--secondary {
  left: 4%;
  top: 9rem;
  transform: rotate(-8deg) scale(0.9);
  animation-delay: -2.4s;
}

.landing-phone__slot {
  position: relative;
  overflow: hidden;
  display: flex;
  height: 100%;
  min-height: 32.5rem;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 1.75rem;
  border: 1px dashed rgba(255, 255, 255, 0.28);
  background:
    linear-gradient(180deg, rgba(var(--lgym-primary-rgb), 0.14), transparent 44%),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 16px);
  padding: 1.25rem;
  color: white;
}

.landing-phone__slot::after {
  content: "";
  position: absolute;
  inset: 42% 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.86));
}

.landing-phone__slot::before {
  content: "";
  pointer-events: none;
  position: absolute;
  z-index: 2;
  inset: 0;
  background: linear-gradient(115deg, transparent 0 34%, rgba(255, 255, 255, 0.22) 46%, transparent 58% 100%);
  opacity: 0;
  transform: translateX(-120%);
  transition:
    opacity 220ms ease,
    transform 720ms ease;
}

.landing-phone:hover .landing-phone__slot::before {
  opacity: 1;
  transform: translateX(120%);
}

.landing-phone__slot img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.landing-phone__slot span,
.landing-screenshot-slot span {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.landing-phone__slot strong {
  position: relative;
  z-index: 1;
  margin-top: 0.55rem;
  font-size: 1.6rem;
  line-height: 1.05;
}

.landing-phone__slot small {
  position: relative;
  z-index: 1;
  margin-top: 0.55rem;
  color: rgba(255, 255, 255, 0.64);
}

.landing-panel-card {
  position: absolute;
  bottom: 0;
  right: 0;
  width: min(92vw, 24rem);
  border: 1px solid rgba(var(--lgym-primary-rgb), 0.24);
  border-radius: 2rem;
  background: color-mix(in srgb, var(--lgym-surface-card) 86%, transparent);
  padding: 1.25rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.18);
  animation: landing-panel-pop 720ms ease both;
}

.landing-rep-counter {
  display: flex;
  gap: 0.35rem;
  margin-top: 1rem;
}

.landing-rep-counter span {
  width: 1.65rem;
  height: 0.38rem;
  border-radius: 999px;
  background: rgba(var(--lgym-primary-rgb), 0.24);
  animation: landing-rep-pulse 1.6s ease-in-out infinite;
}

.landing-rep-counter span:nth-child(2) {
  animation-delay: 160ms;
}

.landing-rep-counter span:nth-child(3) {
  animation-delay: 320ms;
}

.landing-rep-counter span:nth-child(4) {
  animation-delay: 480ms;
}

.landing-panel-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  background: var(--lgym-note-bg);
  padding: 0.85rem 1rem;
  color: var(--lgym-text-muted);
  font-weight: 750;
}

.landing-panel-row span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: var(--lgym-primary);
  box-shadow: 0 0 0 0 rgba(var(--lgym-primary-rgb), 0.48);
  animation: landing-dot-pulse 2.4s ease-in-out infinite;
}

.landing-eyebrow {
  color: var(--lgym-primary);
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.landing-feature-card,
.landing-section-card,
.landing-audience-card {
  border-radius: 2rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  transition: transform 180ms ease;
}

.landing-feature-card,
.landing-audience-card,
.landing-section-card,
.landing-showcase,
.landing-product-section,
.landing-social-card {
  animation: landing-section-rise 720ms ease both;
  animation-timeline: view();
  animation-range: entry 8% cover 28%;
}

.landing-feature-card__icon {
  display: inline-flex;
  margin-bottom: 3rem;
  border-radius: 999px;
  background: rgba(var(--lgym-primary-rgb), 0.13);
  padding: 0.65rem 0.9rem;
  color: var(--lgym-primary);
  font-weight: 950;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.landing-feature-card:hover .landing-feature-card__icon {
  transform: rotate(-4deg) scale(1.06);
  box-shadow: 0 12px 34px rgba(var(--lgym-primary-rgb), 0.2);
}

.landing-feature-card h3,
.landing-audience-card h3,
.landing-section-card h2,
.landing-final-cta h2 {
  color: var(--lgym-text);
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.landing-feature-card h3,
.landing-audience-card h3 {
  font-size: 1.65rem;
}

.landing-feature-card p,
.landing-section-card p,
.landing-audience-card span,
.landing-final-cta p {
  margin-top: 1rem;
  color: var(--lgym-text-muted);
  line-height: 1.75;
}

.landing-section-card h2,
.landing-final-cta h2 {
  margin-top: 1rem;
  font-size: clamp(2.25rem, 5vw, 4.5rem);
}

.landing-showcase {
  display: grid;
  gap: 1.25rem;
  border: 1px solid var(--lgym-border);
  border-radius: 2.5rem;
  background:
    radial-gradient(circle at 18% 12%, rgba(var(--lgym-primary-rgb), 0.18), transparent 18rem),
    color-mix(in srgb, var(--lgym-surface-card) 88%, transparent);
  padding: clamp(1rem, 3vw, 1.5rem);
  backdrop-filter: blur(18px);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.14);
}

.landing-showcase__stage {
  position: relative;
  display: grid;
  min-height: 32rem;
  place-items: center;
  overflow: hidden;
  border-radius: 2rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(var(--lgym-primary-rgb), 0.16)),
    #0a0d0a;
}

.landing-showcase__pulse {
  position: absolute;
  width: min(60vw, 24rem);
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(var(--lgym-primary-rgb), 0.3);
  background: radial-gradient(circle, rgba(var(--lgym-primary-rgb), 0.16), transparent 62%);
  animation: landing-showcase-pulse 3.8s ease-in-out infinite;
}

.landing-showcase-phone {
  position: relative;
  z-index: 1;
  width: min(74vw, 18rem);
  overflow: hidden;
  border: 0.8rem solid #101010;
  border-radius: 2.4rem;
  background: #101010;
  box-shadow: 0 26px 80px rgba(0, 0, 0, 0.34);
  animation: landing-phone-float 8s ease-in-out infinite reverse;
}

.landing-showcase-phone img {
  display: block;
  width: 100%;
  min-height: 30rem;
  object-fit: cover;
}

.landing-showcase__content h3 {
  margin-top: 0.7rem;
  color: var(--lgym-text);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 950;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.landing-showcase__content p:not(.landing-eyebrow) {
  margin-top: 1rem;
  color: var(--lgym-text-muted);
  line-height: 1.75;
}

.landing-product-section {
  display: grid;
  gap: 2rem;
  border: 1px solid var(--lgym-border);
  border-radius: 2.75rem;
  padding: clamp(1.25rem, 4vw, 3rem);
  backdrop-filter: blur(18px);
}

.landing-product-section--athlete {
  background:
    radial-gradient(circle at 85% 15%, rgba(var(--lgym-primary-rgb), 0.2), transparent 20rem),
    color-mix(in srgb, var(--lgym-surface-card) 88%, transparent);
}

.landing-product-section--trainer {
  background:
    radial-gradient(circle at 82% 12%, rgba(var(--lgym-primary-rgb), 0.1), transparent 24rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 251, 248, 0.94));
  color: var(--lgym-text);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.06);
}

.landing-product-section--trainer .landing-product-section__copy h2 {
  color: var(--lgym-text);
  text-shadow: none;
}

.landing-product-section--trainer .landing-product-section__copy p:not(.landing-eyebrow) {
  color: var(--lgym-text-muted);
}

.landing-product-section--trainer .landing-eyebrow {
  color: var(--lgym-primary);
}

.landing-product-section__copy h2,
.landing-social-card h2 {
  margin-top: 1rem;
  color: var(--lgym-text);
  font-size: clamp(2.15rem, 4.4vw, 4.35rem);
  font-weight: 950;
  letter-spacing: -0.048em;
  line-height: 1;
  text-wrap: balance;
}

.landing-product-section__copy p:not(.landing-eyebrow),
.landing-social-card p {
  margin-top: 1.15rem;
  max-width: 44rem;
  color: var(--lgym-text-muted);
  font-size: 1.02rem;
  line-height: 1.8;
}

.landing-product-section--trainer .landing-product-section__copy h2 {
  max-width: 100%;
  color: var(--lgym-text);
  font-size: clamp(2rem, 4vw, 4rem);
  overflow-wrap: anywhere;
  hyphens: auto;
  text-wrap: balance;
}

.landing-product-section--trainer .landing-product-section__copy p:not(.landing-eyebrow) {
  color: var(--lgym-text-muted);
  overflow-wrap: break-word;
}

.landing-product-section--trainer .landing-eyebrow {
  color: var(--lgym-primary);
}

.landing-screen-grid {
  display: grid;
  gap: 1rem;
}

.landing-screen-grid--trainer {
  grid-template-columns: 1fr;
}

.landing-screen-grid--mobile {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: end;
}

.landing-screen-card {
  overflow: hidden;
  border: 1px solid var(--lgym-border);
  background: var(--lgym-surface-card);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12);
}

.landing-screen-card--mobile {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  text-align: left;
  cursor: zoom-in;
  border-radius: 2rem;
  color: inherit;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.landing-screen-card--mobile::before,
.landing-screen-card--trainer::before {
  content: "";
  pointer-events: none;
  position: absolute;
  z-index: 2;
  inset: 0;
  background: linear-gradient(115deg, transparent 0 34%, rgba(255, 255, 255, 0.22) 46%, transparent 58% 100%);
  opacity: 0;
  transform: translateX(-120%);
  transition:
    opacity 220ms ease,
    transform 720ms ease;
}

.landing-screen-card--mobile::after,
.landing-screen-card--trainer::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 18% 18%, rgba(var(--lgym-primary-rgb), 0.18), transparent 34%);
  opacity: 0;
  transition: opacity 220ms ease;
}

.landing-screen-card--mobile:hover::before,
.landing-screen-card--trainer:hover::before,
.landing-screen-card--mobile:focus-visible::before,
.landing-screen-card--trainer:focus-visible::before {
  opacity: 1;
  transform: translateX(120%);
}

.landing-screen-card--mobile:hover::after,
.landing-screen-card--trainer:hover::after,
.landing-screen-card--mobile:focus-visible::after,
.landing-screen-card--trainer:focus-visible::after {
  opacity: 1;
}

.landing-screen-card--mobile:nth-child(even) {
  transform: translateY(2rem);
}

.landing-screen-card--mobile:hover,
.landing-screen-card--mobile:focus-visible {
  border-color: rgba(var(--lgym-primary-rgb), 0.7);
  box-shadow: 0 28px 90px rgba(var(--lgym-primary-rgb), 0.18);
  outline: none;
  transform: translateY(-0.5rem) rotate(-0.8deg);
}

.landing-screen-card--mobile img {
  display: block;
  width: 100%;
  height: clamp(18rem, 42vw, 31rem);
  object-fit: cover;
}

.landing-screen-card--mobile div {
  position: absolute;
  inset: auto 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.86));
  padding: 4rem 1rem 1rem;
  color: white;
}

.landing-preview {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.82);
  padding: clamp(1rem, 4vw, 3rem);
  backdrop-filter: blur(12px);
}

.landing-preview__figure {
  position: relative;
  overflow: hidden;
  width: min(92vw, 34rem);
  max-height: 92vh;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 2rem;
  background: #070907;
  box-shadow: 0 32px 110px rgba(0, 0, 0, 0.55);
}

.landing-preview__figure--wide {
  width: min(94vw, 92rem);
}

.landing-preview__figure img {
  display: block;
  width: 100%;
  max-height: 82vh;
  object-fit: contain;
}

.landing-preview__figure--wide img {
  max-height: 84vh;
}

.landing-preview__figure figcaption {
  position: absolute;
  inset: auto 0 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.88));
  padding: 4rem 1.25rem 1.25rem;
  color: white;
}

.landing-preview__figure figcaption span {
  display: block;
  color: var(--lgym-primary);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.landing-preview__figure figcaption strong {
  display: block;
  margin-top: 0.35rem;
  font-size: clamp(1.35rem, 4vw, 2rem);
  font-weight: 950;
  line-height: 1.05;
}

.landing-preview__close {
  position: fixed;
  z-index: 101;
  top: clamp(1rem, 3vw, 2rem);
  right: clamp(1rem, 3vw, 2rem);
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 2rem;
  line-height: 1;
  transition:
    background 180ms ease,
    transform 180ms ease;
}

.landing-preview__close:hover,
.landing-preview__close:focus-visible {
  background: rgba(var(--lgym-primary-rgb), 0.25);
  outline: none;
  transform: scale(1.04);
}

.landing-screen-card span {
  display: block;
  color: var(--lgym-primary);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.landing-screen-card strong {
  display: block;
  margin-top: 0.45rem;
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  font-weight: 950;
  line-height: 1.05;
}

.landing-screen-card--trainer {
  position: relative;
  overflow: hidden;
  display: grid;
  width: 100%;
  gap: 1rem;
  border-color: rgba(0, 0, 0, 0.1);
  border-radius: 2rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(var(--lgym-primary-rgb), 0.07)),
    #ffffff;
  padding: 0.8rem;
  color: var(--lgym-text);
  text-align: left;
  cursor: zoom-in;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.landing-screen-card--trainer:hover,
.landing-screen-card--trainer:focus-visible {
  border-color: rgba(var(--lgym-primary-rgb), 0.58);
  box-shadow: 0 28px 90px rgba(var(--lgym-primary-rgb), 0.14);
  outline: none;
  transform: translateY(-3px);
}

.landing-trainer-screen-slot {
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 1.35rem;
  background: #f6f7f3;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.landing-trainer-screen-slot__bar {
  display: flex;
  gap: 0.35rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0.65rem 0.75rem;
}

.landing-trainer-screen-slot__bar span {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: rgba(26, 26, 26, 0.28);
}

.landing-trainer-screen-slot__bar span:nth-child(2) {
  animation: landing-dot-pulse 2.6s ease-in-out infinite 220ms;
}

.landing-trainer-screen-slot__body {
  display: grid;
  aspect-ratio: 16 / 9;
  min-height: 11rem;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(var(--lgym-primary-rgb), 0.08), rgba(255, 255, 255, 0.75)),
    repeating-linear-gradient(-45deg, rgba(var(--lgym-primary-rgb), 0.08) 0 1px, transparent 1px 18px);
  padding: 1rem;
  text-align: center;
}

.landing-trainer-screen-slot__body img {
  width: 100%;
  height: 100%;
  min-height: inherit;
  border-radius: 0.9rem;
  object-fit: cover;
  object-position: top center;
}

.landing-trainer-screen-slot__body small {
  color: var(--lgym-text-soft);
  font-weight: 850;
  letter-spacing: 0.04em;
}

.landing-screen-card__copy {
  padding: 0.35rem 0.45rem 0.65rem;
}

.landing-screen-card--trainer p {
  margin-top: 1rem;
  color: var(--lgym-text-muted);
  line-height: 1.7;
}

.landing-social-card {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 2rem;
  align-items: center;
  border: 1px solid var(--lgym-border);
  border-radius: 2.25rem;
  background:
    radial-gradient(circle at 86% 10%, rgba(var(--lgym-primary-rgb), 0.1), transparent 23rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 251, 248, 0.94));
  padding: clamp(1.5rem, 5vw, 4rem);
  color: var(--lgym-text);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.06);
}

.landing-social-card > * {
  position: relative;
  z-index: 1;
}

.landing-social-card h2 {
  color: var(--lgym-text);
}

.landing-social-card p {
  color: var(--lgym-text-muted);
}

.landing-social-links {
  display: grid;
  gap: 0.9rem;
}

.landing-social-links a {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1.4rem;
  background: rgba(255, 255, 255, 0.72);
  padding: 1rem;
  color: var(--lgym-text);
  font-weight: 950;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.landing-social-links a:hover {
  border-color: rgba(var(--lgym-primary-rgb), 0.62);
  background: rgba(var(--lgym-primary-rgb), 0.1);
  transform: translateY(-3px);
}

.landing-social-links i {
  display: grid;
  width: 3.4rem;
  height: 3.4rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background: rgba(var(--lgym-primary-rgb), 0.12);
  color: var(--lgym-primary);
  font-size: 1.65rem;
  line-height: 1;
}

.landing-social-links span {
  display: grid;
  gap: 0.15rem;
}

.landing-social-links strong {
  font-size: 1.08rem;
}

.landing-social-links small {
  color: var(--lgym-text-soft);
  font-size: 0.82rem;
  font-weight: 750;
}

.landing-product-section--trainer-dark {
  background:
    linear-gradient(135deg, rgba(8, 12, 8, 0.92), rgba(17, 24, 17, 0.72)),
    color-mix(in srgb, var(--lgym-surface-card) 82%, transparent);
  color: white;
  box-shadow: none;
}

.landing-product-section--trainer-dark .landing-product-section__copy h2 {
  color: white;
  text-shadow: 0 18px 54px rgba(0, 0, 0, 0.34);
}

.landing-product-section--trainer-dark .landing-product-section__copy p:not(.landing-eyebrow) {
  color: rgba(255, 255, 255, 0.72);
}

.landing-product-section--trainer-dark .landing-eyebrow {
  color: color-mix(in srgb, var(--lgym-primary) 86%, white);
}

.landing-product-section--trainer-dark .landing-screen-card--trainer {
  border-style: dashed;
  border-color: var(--lgym-border);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(var(--lgym-primary-rgb), 0.13)),
    rgba(5, 8, 5, 0.78);
  color: white;
}

.landing-product-section--trainer-dark .landing-trainer-screen-slot {
  border-color: rgba(255, 255, 255, 0.14);
  background: #080b08;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.landing-product-section--trainer-dark .landing-trainer-screen-slot__bar {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.landing-product-section--trainer-dark .landing-trainer-screen-slot__bar span {
  background: rgba(255, 255, 255, 0.34);
}

.landing-product-section--trainer-dark .landing-trainer-screen-slot__body {
  background:
    linear-gradient(135deg, rgba(var(--lgym-primary-rgb), 0.16), rgba(255, 255, 255, 0.04)),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 18px);
}

.landing-product-section--trainer-dark .landing-trainer-screen-slot__body small {
  color: rgba(255, 255, 255, 0.62);
}

.landing-product-section--trainer-dark .landing-screen-card--trainer p {
  color: rgba(255, 255, 255, 0.66);
}

.landing-social-card--dark {
  background:
    radial-gradient(circle at 88% 18%, rgba(var(--lgym-primary-rgb), 0.28), transparent 18rem),
    linear-gradient(135deg, rgba(5, 8, 5, 0.94), rgba(19, 28, 19, 0.84));
  color: white;
  box-shadow: none;
}

.landing-social-card--dark h2 {
  color: white;
}

.landing-social-card--dark p {
  color: rgba(255, 255, 255, 0.68);
}

.landing-social-card--dark .landing-social-links a {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.07);
  color: white;
}

.landing-social-card--dark .landing-social-links a:hover {
  border-color: rgba(var(--lgym-primary-rgb), 0.62);
  background: rgba(var(--lgym-primary-rgb), 0.16);
}

.landing-social-card--dark .landing-social-links i {
  background: rgba(0, 0, 0, 0.34);
}

.landing-social-card--dark .landing-social-links small {
  color: rgba(255, 255, 255, 0.58);
}

.landing-screenshot-slot {
  display: flex;
  min-height: 25rem;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 2rem;
  border: 1px dashed rgba(255, 255, 255, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(var(--lgym-primary-rgb), 0.16)),
    #101510;
  padding: 1.25rem;
  color: white;
}

.landing-screenshot-slot:nth-child(2) {
  margin-top: 3rem;
}

.landing-screenshot-slot strong {
  margin-top: 0.65rem;
  font-size: 1.35rem;
  line-height: 1.1;
}

.landing-audience-card p {
  color: var(--lgym-primary);
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.landing-final-cta {
  display: grid;
  position: relative;
  overflow: hidden;
  gap: 2rem;
  align-items: center;
  border-radius: 2.5rem;
  border-color: rgba(var(--lgym-primary-rgb), 0.28);
  background:
    radial-gradient(circle at 12% 18%, rgba(var(--lgym-primary-rgb), 0.16), transparent 18rem),
    color-mix(in srgb, var(--lgym-surface-card) 96%, transparent);
  padding: clamp(1.5rem, 5vw, 4rem);
  opacity: 1;
  box-shadow: 0 30px 100px rgba(var(--lgym-primary-rgb), 0.12);
}

.landing-final-cta::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: auto -8% -42% auto;
  width: min(42vw, 20rem);
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(var(--lgym-primary-rgb), 0.2);
  background: repeating-conic-gradient(from 12deg, rgba(var(--lgym-primary-rgb), 0.12) 0 9deg, transparent 9deg 22deg);
  opacity: 0.62;
}

.landing-store-button {
  position: relative;
  overflow: hidden;
  min-width: 13.5rem;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.85rem;
  row-gap: 0.12rem;
  align-items: center;
  border: 1px solid var(--lgym-border-strong);
  background: #111;
  padding: 0.9rem 1.25rem;
  color: white;
  line-height: 1.05;
}

.landing-store-button .v-icon {
  grid-row: 1 / 4;
  transition: transform 220ms ease;
}

.landing-store-button:hover .v-icon {
  transform: translateY(-1px) scale(1.08);
}

.landing-store-button span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.72rem;
}

.landing-store-button strong {
  font-size: 1.15rem;
}

.landing-store-button small,
.landing-download-status {
  color: var(--lgym-text-soft);
  font-size: 0.78rem;
  font-weight: 750;
}

.landing-store-button small {
  color: rgba(255, 255, 255, 0.62);
}

@media (min-width: 1024px) {
  .landing-header__nav {
    display: flex;
  }

  .landing-final-cta {
    grid-template-columns: 1fr auto;
  }

  .landing-product-section,
  .landing-social-card {
    grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
    align-items: center;
  }

  .landing-product-section--trainer {
    grid-template-columns: minmax(18rem, 0.7fr) minmax(0, 1.3fr);
  }

  .landing-screen-grid--trainer {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-screen-card--trainer:first-child {
    grid-column: 1 / -1;
  }

  .landing-showcase {
    grid-template-columns: minmax(18rem, 0.85fr) minmax(20rem, 1fr);
    align-items: center;
  }

}

@media (min-width: 1280px) {
  .landing-product-section--trainer .landing-product-section__copy h2 {
    max-width: 32rem;
    font-size: clamp(3rem, 4.6vw, 4.65rem);
  }

  .landing-product-section--trainer .landing-product-section__copy p:not(.landing-eyebrow) {
    max-width: 31rem;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .landing-product-section,
  .landing-social-card,
  .landing-showcase {
    grid-template-columns: 1fr;
  }

  .landing-product-section__copy h2,
  .landing-social-card h2 {
    max-width: 48rem;
    font-size: clamp(2.4rem, 6vw, 4.2rem);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .landing-product-section,
  .landing-social-card,
  .landing-showcase {
    grid-template-columns: 1fr;
    border-radius: 2rem;
  }

  .landing-product-section__copy h2,
  .landing-social-card h2 {
    font-size: clamp(2.35rem, 7vw, 4.1rem);
  }
}

@media (max-width: 767px) {
  .landing-header {
    padding-top: 1rem;
    padding-bottom: 0.75rem;
  }

  .landing-header__inner {
    align-items: flex-start;
    gap: 0.75rem 1rem;
  }

  .landing-header__brand img {
    width: clamp(4rem, 18vw, 5rem);
  }

  .landing-header__nav {
    display: flex;
    flex-wrap: wrap;
    order: 3;
    width: 100%;
    max-width: 100%;
    overflow: visible;
    gap: 0.35rem;
    padding-bottom: 0.15rem;
  }

  .landing-header__nav a {
    flex: 0 0 auto;
    padding: 0.62rem 0.78rem;
    font-size: 0.82rem;
    white-space: nowrap;
  }

  .landing-phone {
    width: 14.5rem;
    min-height: 29rem;
  }

  .landing-product-section,
  .landing-social-card {
    border-radius: 1.65rem;
    padding: 1rem;
  }

  .landing-product-section__copy h2,
  .landing-social-card h2 {
    font-size: clamp(2rem, 12vw, 3.15rem);
    letter-spacing: -0.04em;
  }

  .landing-product-section__copy p:not(.landing-eyebrow),
  .landing-social-card p {
    font-size: 0.96rem;
  }

  .landing-phone__slot {
    min-height: 27.5rem;
  }

  .landing-phone--primary {
    right: 0;
  }

  .landing-phone--secondary {
    left: 0;
  }

  .landing-orbit {
    display: none;
  }

  .landing-gym-plate {
    display: none;
  }

  .landing-panel-card {
    bottom: -1rem;
    left: 0;
    right: 0;
    width: min(100%, 22rem);
    margin-inline: auto;
  }

  .landing-screenshot-slot:nth-child(2) {
    margin-top: 0;
  }

  .landing-screen-grid--mobile {
    grid-template-columns: 1fr;
  }

  .landing-screen-card--mobile:nth-child(even) {
    transform: none;
  }

  .landing-screen-card--trainer {
    border-radius: 1.35rem;
  }

  .landing-trainer-screen-slot {
    border-radius: 1rem;
  }

  .landing-trainer-screen-slot__body {
    min-height: 9rem;
  }

  .landing-social-links a {
    align-items: flex-start;
    border-radius: 1.15rem;
  }
}

@keyframes landing-ambient-breathe {
  from {
    transform: scale(1) translate3d(0, 0, 0);
    opacity: 0.58;
  }
  to {
    transform: scale(1.08) translate3d(1rem, -0.8rem, 0);
    opacity: 0.86;
  }
}

@keyframes landing-sweep {
  0%,
  54% {
    transform: translateX(-120%);
  }
  78%,
  100% {
    transform: translateX(120%);
  }
}

@keyframes landing-orbit-drift {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(8deg) scale(1.04);
  }
}

@keyframes landing-plate-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes landing-phone-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -0.85rem;
  }
}

@keyframes landing-panel-pop {
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes landing-rep-line {
  0%,
  100% {
    transform: scaleX(0.28);
  }
  50% {
    transform: scaleX(1);
  }
}

@keyframes landing-rep-pulse {
  0%,
  100% {
    background: rgba(var(--lgym-primary-rgb), 0.22);
    transform: scaleX(0.72);
  }
  45% {
    background: var(--lgym-primary);
    transform: scaleX(1);
  }
}

@keyframes landing-dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--lgym-primary-rgb), 0.44);
  }
  50% {
    box-shadow: 0 0 0 0.4rem rgba(var(--lgym-primary-rgb), 0);
  }
}

@keyframes landing-section-rise {
  from {
    opacity: 0;
    transform: translateY(1.5rem) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes landing-showcase-pulse {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.38;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.72;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-page::before,
  .landing-noise::after,
  .landing-orbit,
  .landing-gym-plate,
  .landing-phone,
  .landing-panel-card,
  .landing-rep-counter span,
  .landing-panel-row span,
  .landing-metric::after,
  .landing-showcase-phone,
  .landing-showcase__pulse,
  .landing-feature-card,
  .landing-audience-card,
  .landing-section-card,
  .landing-showcase,
  .landing-product-section,
  .landing-social-card,
  .landing-final-cta {
    animation: none;
  }

  .landing-cta,
  .landing-store-button,
  .landing-feature-card,
  .landing-screen-card--mobile,
  .landing-screen-card--trainer,
  .landing-audience-card,
  .landing-social-links a {
    transition: none;
  }

  .landing-cta--primary::after,
  .landing-store-button::after,
  .landing-phone__slot::before,
  .landing-screen-card--mobile::before,
  .landing-screen-card--mobile::after,
  .landing-screen-card--trainer::before,
  .landing-screen-card--trainer::after {
    opacity: 0;
    transform: none;
    transition: none;
  }

  .landing-cta--primary:hover::after,
  .landing-store-button:hover::after,
  .landing-phone:hover .landing-phone__slot::before,
  .landing-screen-card--mobile:hover::before,
  .landing-screen-card--mobile:hover::after,
  .landing-screen-card--trainer:hover::before,
  .landing-screen-card--trainer:hover::after,
  .landing-screen-card--mobile:focus-visible::before,
  .landing-screen-card--mobile:focus-visible::after,
  .landing-screen-card--trainer:focus-visible::before,
  .landing-screen-card--trainer:focus-visible::after {
    opacity: 0;
    transform: none;
  }
}
</style>
