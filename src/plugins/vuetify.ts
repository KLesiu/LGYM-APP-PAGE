import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#F5F5F5",
          surface: "#FFFFFF",
          primary: "#20BC2D",
          secondary: "#6B6B6B",
          error: "#E53935",
          info: "#0288D1",
          success: "#2E7D32",
          warning: "#ED6C02",
          outline: "#E0E0E0",
          "on-primary": "#FFFFFF",
          "on-surface": "#1A1A1A",
          "on-background": "#1A1A1A",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#0A0A0A",
          surface: "#141414",
          primary: "#20BC2D",
          secondary: "#A3AAB8",
          error: "#F2B8B5",
          info: "#8CCFFF",
          success: "#8FD8A7",
          warning: "#F8C58C",
          outline: "#2A2A2A",
          "on-primary": "#FFFFFF",
          "on-surface": "#E8E6E6",
          "on-background": "#E8E6E6",
        },
      },
    },
  },
  defaults: {
    VBtn: {
      variant: "flat",
      rounded: "xl",
      class: "font-semibold normal-case tracking-normal",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      rounded: "xl",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      rounded: "xl",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      rounded: "xl",
      hideDetails: "auto",
      baseColor: "outline",
      color: "primary",
      bgColor: "surface",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
      rounded: "xl",
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
      rounded: "lg",
    },
    VCard: {
      rounded: "xl",
    },
    VAlert: {
      variant: "tonal",
      density: "comfortable",
      border: "start",
      rounded: "xl",
    },
    VTab: {
      rounded: "xl",
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
