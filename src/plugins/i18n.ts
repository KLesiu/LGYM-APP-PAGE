import { createI18n } from "vue-i18n";
import { en as vuetifyEn, pl as vuetifyPl } from "vuetify/locale";

import en from "../locales/en.json";
import pl from "../locales/pl.json";

const anonymizeVisibleBrand = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value
      .replaceAll("LGYM APP PAGE", "Training Hub")
      .replaceAll("LGYM Mobile", "Training Hub Mobile")
      .replaceAll("LGYM APP", "Training Hub")
      .replaceAll("LGYM", "Training Hub");
  }

  if (Array.isArray(value)) {
    return value.map(anonymizeVisibleBrand);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        anonymizeVisibleBrand(nestedValue),
      ]),
    );
  }

  return value;
};

const neutralEnglishMessages = anonymizeVisibleBrand(en) as typeof en;
const neutralPolishMessages = anonymizeVisibleBrand(pl) as typeof pl;

export const i18n = createI18n({
  legacy: false,
  locale: "pl",
  fallbackLocale: "en",
  messages: {
    en: {
      ...neutralEnglishMessages,
      $vuetify: vuetifyEn,
    },
    pl: {
      ...neutralPolishMessages,
      $vuetify: vuetifyPl,
    },
  },
});
