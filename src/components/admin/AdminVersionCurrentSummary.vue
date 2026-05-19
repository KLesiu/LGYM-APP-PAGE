<template>
  <article
 class="rounded-3xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-muted)] px-6 py-6 lg:px-7 lg:py-7"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <p
          class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]"
        >
          {{ t("admin.versions.current.eyebrow") }}
        </p>
        <h3 class="text-2xl font-semibold text-[var(--lgym-text)]">
          {{ platformLabel }}
        </h3>
      </div>

      <v-chip
        size="small"
        rounded="pill"
        :color="currentConfig?.forceUpdate ? 'warning' : 'success'"
        class="self-start"
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
      class="mt-6"
    />

    <template v-else>
      <div v-if="currentConfig" class="mt-6 grid gap-5 sm:grid-cols-2">
        <div
 class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5"
        >
          <p
            class="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.latestVersion") }}
          </p>
          <p
            class="mt-3 text-base font-semibold leading-relaxed text-[var(--lgym-text)]"
          >
            {{ currentConfig.latestVersion || "—" }}
          </p>
        </div>

        <div
 class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5"
        >
          <p
            class="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.minRequiredVersion") }}
          </p>
          <p
            class="mt-3 text-base font-semibold leading-relaxed text-[var(--lgym-text)]"
          >
            {{ currentConfig.minRequiredVersion || "—" }}
          </p>
        </div>

        <div
 class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5 sm:col-span-2"
        >
          <p
            class="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.updateUrl") }}
          </p>
          <p
            class="mt-3 break-all text-sm font-semibold leading-7 text-[var(--lgym-text)]"
          >
            {{ currentConfig.updateUrl || "—" }}
          </p>
        </div>

        <div
 class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5 sm:col-span-2"
        >
          <p
            class="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]"
          >
            {{ t("admin.versions.fields.releaseNotes") }}
          </p>
          <p
            class="mt-3 overflow-hidden whitespace-pre-line text-sm font-medium leading-7 text-[var(--lgym-text)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5]"
          >
            {{ currentConfig.releaseNotes || "—" }}
          </p>
        </div>
      </div>

      <div
        v-else
 class="mt-6 rounded-[24px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5"
      >
        <p class="text-sm leading-7 text-[var(--lgym-text-muted)]">
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
  currentConfig: AppConfigInfoDto | null | undefined;
  isLoading: boolean;
}>();

const { t } = useI18n();
</script>
