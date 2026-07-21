import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import { useI18n } from "vue-i18n";

import { i18n } from "./i18n";

export const vuetify = createVuetify({
  components,
  directives,
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  display: {
    mobileBreakpoint: "lg",
    thresholds: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  icons: {
    defaultSet: "mdi",
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#F3F6FA",
          surface: "#FFFFFF",
          primary: "#0F766E",
          secondary: "#475569",
          error: "#DC2626",
          info: "#2563EB",
          success: "#15803D",
          warning: "#D97706",
          outline: "#CBD5E1",
          "surface-variant": "#E9EFF6",
          "on-primary": "#FFFFFF",
          "on-surface": "#0F172A",
          "on-background": "#0F172A",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#07111F",
          surface: "#0F1C2E",
          primary: "#2DD4BF",
          secondary: "#94A3B8",
          error: "#FCA5A5",
          info: "#93C5FD",
          success: "#86EFAC",
          warning: "#FCD34D",
          outline: "#334155",
          "surface-variant": "#132238",
          "on-primary": "#042F2E",
          "on-surface": "#F8FAFC",
          "on-background": "#F8FAFC",
        },
      },
    },
  },
  defaults: {
    VBtn: {
      variant: "flat",
      rounded: "lg",
      class: "font-semibold normal-case tracking-normal",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
      rounded: "lg",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VCheckbox: {
      color: "primary",
      hideDetails: "auto",
    },
    VRadio: {
      color: "primary",
    },
    VSwitch: {
      color: "primary",
      hideDetails: true,
      inset: true,
    },
    VChip: {
      variant: "tonal",
      rounded: "md",
    },
    VCard: {
      rounded: "lg",
    },
    VAlert: {
      variant: "tonal",
      density: "comfortable",
      border: "start",
      rounded: "lg",
    },
    VTab: {
      rounded: "lg",
      class: "normal-case tracking-normal font-semibold",
    },
    VDialog: {
      maxWidth: 560,
    },
    VList: {
      density: "comfortable",
    },
    VProgressLinear: {
      color: "primary",
    },
  },
});
