<template>
  <section class="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <p
        class="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--v-theme-primary))]"
      >
        {{ t("trainerInvitations.form.eyebrow") }}
      </p>
      <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
        {{ t("trainerInvitations.form.title") }}
      </h2>
      <p class="mt-2 max-w-md text-sm leading-6 text-[var(--lgym-text-muted)]">
        {{ t("trainerInvitations.form.subtitle") }}
      </p>
    </div>

    <div class="flex flex-1 flex-col gap-5 px-6 py-6 lg:px-8 lg:py-8">
      <v-form
        ref="formRef"
        v-model="isFormValid"
        validate-on="submit lazy"
        class="flex flex-1 flex-col gap-4"
        @submit.prevent="submitForm"
      >
        <v-text-field
          v-model="email"
          type="email"
          :label="t('trainerInvitations.form.fields.email')"
          :placeholder="t('trainerInvitations.form.placeholders.email')"
          :rules="emailRules"
          autocomplete="email"
          :disabled="isSubmitting"
        />

        <v-select
          v-model="preferredLanguage"
          :label="t('trainerInvitations.form.fields.preferredLanguage')"
          :items="languageOptions"
          item-title="label"
          item-value="value"
          :rules="
            requiredRules(
              t('trainerInvitations.form.validation.languageRequired'),
            )
          "
          :disabled="isSubmitting"
        />

        <v-combobox
          v-model="preferredTimeZone"
          :label="t('trainerInvitations.form.fields.preferredTimeZone')"
          :items="timeZoneOptions"
          :rules="
            requiredRules(
              t('trainerInvitations.form.validation.timeZoneRequired'),
            )
          "
          :disabled="isSubmitting"
          :menu-props="{ maxHeight: 320 }"
        />

      
        <div class="border-t border-[var(--lgym-border)] pt-4">
          <v-btn
            type="submit"
            color="primary"
            size="large"
            class="min-h-11 rounded-md px-5 font-semibold normal-case tracking-normal"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t("trainerInvitations.form.actions.submit") }}
          </v-btn>
        </div>
      </v-form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import type { CreateTrainerInvitationByEmailRequest } from "../../api/model";

const props = defineProps<{
  defaultLanguage: string;
  defaultTimeZone: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateTrainerInvitationByEmailRequest];
}>();

const { t } = useI18n();

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);
const isFormValid = ref<boolean | null>(null);

const email = ref("");
const preferredLanguage = ref(props.defaultLanguage);
const preferredTimeZone = ref(props.defaultTimeZone);

const safeSupportedTimeZones = () => {
  const detected = props.defaultTimeZone;
  const fallbacks = [detected, "Europe/Warsaw", "UTC"];

  try {
    const supportedValuesOf = (
      Intl as typeof Intl & {
        supportedValuesOf?: (key: string) => string[];
      }
    ).supportedValuesOf;

    if (typeof supportedValuesOf === "function") {
      const timeZones = supportedValuesOf("timeZone");
      return [detected, ...timeZones].filter(
        (value, index, array) => value && array.indexOf(value) === index,
      );
    }
  } catch {
    // Ignore and use fallbacks below.
  }

  return fallbacks.filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );
};

const timeZoneOptions = computed(() => safeSupportedTimeZones());
const languageOptions = computed(() => [
  {
    value: "pl",
    label: t("ui.language.polish"),
  },
  {
    value: "en",
    label: t("ui.language.english"),
  },
]);

const requiredRules = (message: string) => [
  (value: string | null | undefined) => !!value || message,
];

const emailRules = [
  (value: string) => !!value || t("auth.validation.emailRequired"),
  (value: string) =>
    /.+@.+\..+/.test(value) || t("auth.validation.emailInvalid"),
];

const resetForm = () => {
  email.value = "";
  preferredLanguage.value = props.defaultLanguage;
  preferredTimeZone.value = props.defaultTimeZone;
  formRef.value?.resetValidation();
};

const submitForm = async () => {
  if (!formRef.value) return;

  const validation = await formRef.value.validate();
  if (!validation.valid) return;

  emit("submit", {
    email: email.value.trim(),
    preferredLanguage: preferredLanguage.value,
    preferredTimeZone: preferredTimeZone.value.trim(),
  });
};

watch(
  () => props.defaultLanguage,
  (value) => {
    if (!preferredLanguage.value) {
      preferredLanguage.value = value;
    }
  },
);

watch(
  () => props.defaultTimeZone,
  (value) => {
    if (!preferredTimeZone.value) {
      preferredTimeZone.value = value;
    }
  },
);

defineExpose({
  resetForm,
});
</script>
