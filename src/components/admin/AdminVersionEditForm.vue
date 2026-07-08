<template>
  <v-form
    class="flex flex-col gap-7"
    @submit.prevent="$emit('submit')"
  >
    <div class="grid gap-5 lg:gap-6 md:grid-cols-2">
      <v-text-field
        :model-value="latestVersion"
        :label="t('admin.versions.fields.latestVersion')"
        :placeholder="t('admin.versions.placeholders.version')"
        autocomplete="off"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        @update:model-value="$emit('update:latestVersion', $event)"
      />

      <v-text-field
        :model-value="minRequiredVersion"
        :label="t('admin.versions.fields.minRequiredVersion')"
        :placeholder="t('admin.versions.placeholders.version')"
        autocomplete="off"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        @update:model-value="$emit('update:minRequiredVersion', $event)"
      />

      <v-text-field
        :model-value="updateUrl"
        :label="t('admin.versions.fields.updateUrl')"
        :placeholder="
          platform === 'Android'
            ? t('admin.versions.placeholders.androidUrl')
            : t('admin.versions.placeholders.iosUrl')
        "
        autocomplete="off"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="md:col-span-2"
        @update:model-value="$emit('update:updateUrl', $event)"
      />
    </div>

    <v-textarea
      :model-value="releaseNotes"
      :label="t('admin.versions.fields.releaseNotes')"
      :placeholder="t('admin.versions.placeholders.releaseNotes')"
      rows="4"
      auto-grow
      variant="outlined"
      density="comfortable"
      hide-details="auto"
      @update:model-value="$emit('update:releaseNotes', $event)"
    />

    <div
      class="rounded-3xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5 lg:px-6 lg:py-6"
    >
      <div
        class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="max-w-2xl">
          <p class="text-sm font-semibold text-[var(--lgym-text)]">
            {{ t("admin.versions.fields.forceUpdate") }}
          </p>
          <p class="mt-3 text-sm leading-7 text-[var(--lgym-text-muted)]">
            {{ t("admin.versions.fields.forceUpdateHint") }}
          </p>
        </div>

        <v-switch
          :model-value="forceUpdate"
          inset
          color="primary"
          class="self-start lg:self-center"
          hide-details
          @update:model-value="$emit('update:forceUpdate', !!$event)"
        />
      </div>
    </div>

    <div class="flex flex-col gap-3 border-t border-[var(--lgym-border)] pt-5 sm:flex-row sm:justify-end">
      <v-btn
        variant="outlined"
        color="primary"
        class="min-h-[52px] px-6 lg:px-7"
        @click="$emit('loadCurrent')"
      >
        {{ t("admin.versions.actions.loadCurrent") }}
      </v-btn>

      <v-btn
        type="submit"
        color="primary"
        class="min-h-[52px] px-6 lg:px-7"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ t("admin.versions.actions.submit") }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

type VersionPlatform = "Android" | "Ios";

defineProps<{
  platform: VersionPlatform;
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  releaseNotes: string;
  forceUpdate: boolean;
  isSubmitting: boolean;
}>();

defineEmits<{
  submit: [];
  loadCurrent: [];
  "update:latestVersion": [value: string];
  "update:minRequiredVersion": [value: string];
  "update:updateUrl": [value: string];
  "update:releaseNotes": [value: string];
  "update:forceUpdate": [value: boolean];
}>();

const { t } = useI18n();
</script>
