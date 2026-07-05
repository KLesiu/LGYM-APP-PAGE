<template>
  <div
    class="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,380px)] justify-end sm:right-5 sm:top-5"
  >
    <TransitionGroup
      tag="div"
      class="flex w-full flex-col gap-3"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
      move-class="transition duration-200 ease-out"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex flex-col gap-2 overflow-hidden rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)] backdrop-blur"
      >
        <div :class="accentClassMap[toast.type]" class="h-1 w-full" />

        <div class="flex items-start gap-3 px-5 py-4.5 sm:px-5.5">
          <div
            :class="iconClassMap[toast.type]"
          class="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lgym-note-bg)]"
          >
            <v-icon :icon="iconMap[toast.type]" size="18" />
          </div>

          <div class="min-w-0 flex-1 pr-2">
            <p class="text-sm leading-5 font-semibold text-[var(--lgym-text)]">
              {{ t(titleKeyMap[toast.type]) }}
            </p>
            <p class="text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{
                toast.message ??
                (toast.resourceKey
                  ? t(toast.resourceKey, toast.params ?? {})
                  : "")
              }}
            </p>
          </div>

          <button
            type="button"
          class="mt-0.5 ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-xl text-[var(--lgym-text-soft)] transition-colors hover:bg-[var(--lgym-overlay)] hover:text-[var(--lgym-text)]"
            :aria-label="t('common.actions.dismiss')"
            @click="remove(toast.id)"
          >
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useToast, type ToastType } from "../../composables/useToast";

const { t } = useI18n();
const { toasts, remove } = useToast();

const iconMap: Record<ToastType, string> = {
  success: "mdi-check-circle-outline",
  error: "mdi-alert-circle-outline",
  warning: "mdi-alert-outline",
  info: "mdi-information-outline",
};

const titleKeyMap: Record<ToastType, string> = {
  success: "common.toastTitles.success",
  error: "common.toastTitles.error",
  warning: "common.toastTitles.warning",
  info: "common.toastTitles.info",
};

const accentClassMap: Record<ToastType, string> = {
  success: "bg-[var(--lgym-success)]",
  error: "bg-[var(--lgym-error)]",
  warning: "bg-[var(--lgym-warning)]",
  info: "bg-[var(--lgym-info)]",
};

const iconClassMap: Record<ToastType, string> = {
  success: "text-[var(--lgym-success)]",
  error: "text-[var(--lgym-error)]",
  warning: "text-[var(--lgym-warning)]",
  info: "text-[var(--lgym-info)]",
};
</script>
