<template>
  <article
    class="border border-[var(--lgym-border)] rounded-3xl bg-[var(--lgym-surface-muted)] p-5"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p
          class="text-[var(--lgym-primary)] text-xs font-semibold uppercase tracking-[0.24em]"
        >
          {{ t("admin.versions.current.eyebrow") }}
        </p>
        <h3 class="text-[var(--lgym-text)] mt-2 text-xl font-semibold">
          {{ platformLabel }}
        </h3>
      </div>

      <v-chip
        size="small"
        :color="currentConfig?.forceUpdate ? 'warning' : 'success'"
      >
        {{
          currentConfig?.forceUpdate
            ? t("admin.versions.current.forceRequired")
            : t("admin.versions.current.optional")
        }}
      </v-chip>
    </div>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mt-4"
    />

    <template v-else>
      <v-alert
        v-if="loadError"
        type="warning"
        class="mt-4 rounded-2xl"
        :text="loadError"
      />

      <div v-else-if="currentConfig" class="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          class="border border-[var(--lgym-border)] rounded-[20px] bg-[var(--lgym-note-bg)] p-4"
        >
          <p
            class="m-0 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.latestVersion") }}
          </p>
          <p
            class="mt-2 text-[var(--lgym-text)] text-base font-semibold leading-relaxed"
          >
            {{ currentConfig.latestVersion || "—" }}
          </p>
        </div>

        <div
          class="border border-[var(--lgym-border)] rounded-[20px] bg-[var(--lgym-note-bg)] p-4"
        >
          <p
            class="m-0 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.minRequiredVersion") }}
          </p>
          <p
            class="mt-2 text-[var(--lgym-text)] text-base font-semibold leading-relaxed"
          >
            {{ currentConfig.minRequiredVersion || "—" }}
          </p>
        </div>

        <div
          class="border border-[var(--lgym-border)] rounded-[20px] bg-[var(--lgym-note-bg)] p-4 sm:col-span-2"
        >
          <p
            class="m-0 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.updateUrl") }}
          </p>
          <p
            class="mt-2 text-[var(--lgym-text)] text-base font-semibold leading-relaxed break-all text-sm"
          >
            {{ currentConfig.updateUrl || "—" }}
          </p>
        </div>

        <div
          class="border border-[var(--lgym-border)] rounded-[20px] bg-[var(--lgym-note-bg)] p-4 sm:col-span-2"
        >
          <p
            class="m-0 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.releaseNotes") }}
          </p>
          <p
            class="mt-2 text-[var(--lgym-text)] text-base font-semibold leading-relaxed whitespace-pre-line text-sm font-medium"
          >
            {{ currentConfig.releaseNotes || "—" }}
          </p>
        </div>
      </div>

      <div
        v-else
        class="border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] mt-4 rounded-[24px] p-5"
      >
        <p class="text-[var(--lgym-text-muted)] text-sm leading-6">
          {{ t("admin.versions.feedback.noConfig") }}
        </p>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { AppConfigInfoDto } from "../../api/model";

defineProps<{
  platformLabel: string;
  currentConfig: AppConfigInfoDto | null;
  isLoading: boolean;
  loadError: string;
}>();

const { t } = useI18n();
</script>
