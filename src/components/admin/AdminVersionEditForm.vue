<template>
  <v-form class="flex flex-col gap-4" @submit.prevent="$emit('submit')">
    <v-alert
      v-if="submitError"
      type="error"
      class="rounded-2xl"
      :text="submitError"
    />

    <v-alert
      v-if="submitSuccess"
      type="success"
      class="rounded-2xl"
      :text="submitSuccess"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <v-text-field
        :model-value="latestVersion"
        :label="t('admin.versions.fields.latestVersion')"
        :placeholder="t('admin.versions.placeholders.version')"
        autocomplete="off"
        @update:model-value="$emit('update:latestVersion', $event)"
      />

      <v-text-field
        :model-value="minRequiredVersion"
        :label="t('admin.versions.fields.minRequiredVersion')"
        :placeholder="t('admin.versions.placeholders.version')"
        autocomplete="off"
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
        @update:model-value="$emit('update:updateUrl', $event)"
      />
    </div>

    <v-textarea
      :model-value="releaseNotes"
      :label="t('admin.versions.fields.releaseNotes')"
      :placeholder="t('admin.versions.placeholders.releaseNotes')"
      rows="4"
      auto-grow
      @update:model-value="$emit('update:releaseNotes', $event)"
    />

    <div
      class="border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] rounded-3xl p-4"
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-[var(--lgym-text)] text-sm font-semibold">
            {{ t("admin.versions.fields.forceUpdate") }}
          </p>
          <p class="text-[var(--lgym-text-muted)] mt-1 text-sm leading-6">
            {{ t("admin.versions.fields.forceUpdateHint") }}
          </p>
        </div>

        <v-switch
          :model-value="forceUpdate"
          class="self-start sm:self-center"
          @update:model-value="$emit('update:forceUpdate', !!$event)"
        />
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <v-btn variant="outlined" color="primary" @click="$emit('loadCurrent')">
        {{ t("admin.versions.actions.loadCurrent") }}
      </v-btn>

      <v-btn
        type="submit"
        color="primary"
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
  submitError: string;
  submitSuccess: string;
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
