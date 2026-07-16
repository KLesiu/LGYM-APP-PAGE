<template>
  <div class="flex min-h-full min-w-0 flex-col gap-4">
    <AppDataSection
      :eyebrow="t('userAccount.page.eyebrow')"
      :title="t('userAccount.page.title')"
      :subtitle="t('userAccount.page.subtitle')"
      :show-pagination="false"
      class="flex-1"
    >
      <div class="flex flex-col gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <section class="flex flex-col gap-4 px-0 py-0">
          <div class="lgym-section-heading max-w-3xl">
            <h2 class="text-xl font-semibold text-[var(--lgym-text)]">
              {{ t("userAccount.identity.title") }}
            </h2>
            <p class="lgym-section-heading__subtitle text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("userAccount.identity.subtitle") }}
            </p>
          </div>

          <div class="overflow-hidden rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5 shadow-[var(--lgym-shadow-surface)] sm:px-6 sm:py-6">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex min-w-0 items-center gap-4">
                <v-avatar v-if="currentUser?.avatar" size="56">
                  <v-img :src="currentUser.avatar" />
                </v-avatar>
                <v-avatar v-else size="56" color="primary" class="text-base font-bold">
                  {{ currentUser?.initials ?? "?" }}
                </v-avatar>

                <div class="min-w-0 space-y-1">
                  <p class="truncate text-base font-semibold text-[var(--lgym-text)]">
                    {{ currentUser?.name || t("userAccount.fallback") }}
                  </p>
                  <p class="break-all text-sm text-[var(--lgym-text-muted)]">
                    {{ currentUser?.email || t("userAccount.fallback") }}
                  </p>
                </div>
              </div>

              <v-chip color="primary" variant="tonal" size="small" class="self-start font-semibold lg:self-auto">
                {{ currentUser?.role || t("userAccount.fallback") }}
              </v-chip>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <article class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/72 px-5 py-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]">
                  {{ t("userAccount.fields.name") }}
                </p>
                <p class="mt-3 break-all text-sm font-semibold text-[var(--lgym-text)]">
                  {{ currentUser?.name || t("userAccount.fallback") }}
                </p>
              </article>
              <article class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/72 px-5 py-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]">
                  {{ t("userAccount.fields.email") }}
                </p>
                <p class="mt-3 break-all text-sm font-semibold text-[var(--lgym-text)]">
                  {{ currentUser?.email || t("userAccount.fallback") }}
                </p>
              </article>
              <article class="rounded-[22px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/72 px-5 py-5">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-muted)]">
                  {{ t("userAccount.fields.role") }}
                </p>
                <p class="mt-3 break-all text-sm font-semibold text-[var(--lgym-text)]">
                  {{ currentUser?.role || t("userAccount.fallback") }}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-4 px-0 py-0">
          <div class="lgym-section-heading max-w-3xl">
            <h2 class="text-xl font-semibold text-[var(--lgym-text)]">
              {{ t("userAccount.delete.title") }}
            </h2>
            <p class="lgym-section-heading__subtitle text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("userAccount.delete.description") }}
            </p>
          </div>

          <div class="flex flex-col gap-4 rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5 shadow-[var(--lgym-shadow-surface)] sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex min-w-0 items-start gap-3">
              <div class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--lgym-surface-card)] text-[rgb(var(--v-theme-error))]">
                <v-icon icon="mdi-shield-alert-outline" size="22" />
              </div>
              <div class="min-w-0 space-y-1">
                <p class="font-semibold text-[var(--lgym-text)]">
                  {{ t("userAccount.delete.cardTitle") }}
                </p>
                <p class="max-w-2xl text-sm leading-6 text-[var(--lgym-text-muted)]">
                  {{ t("userAccount.delete.cardDescription") }}
                </p>
              </div>
            </div>

            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete-outline"
              class="min-h-10 rounded-md px-4"
              :loading="isDeletingAccount"
              :disabled="!currentUser || isDeletingAccount"
              @click="isDeleteDialogOpen = true"
            >
              {{ t("userAccount.actions.delete") }}
            </v-btn>
          </div>
        </section>
      </div>
    </AppDataSection>

    <v-dialog v-model="isDeleteDialogOpen" max-width="420">
      <v-card class="rounded-2xl">
        <v-card-title class="text-lg font-semibold">
          {{ t("userAccount.confirm.title") }}
        </v-card-title>
        <v-card-text class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("userAccount.confirm.message") }}
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="isDeletingAccount" @click="isDeleteDialogOpen = false">
            {{ t("common.actions.cancel") }}
          </v-btn>
          <v-btn color="error" :loading="isDeletingAccount" @click="deleteAccount">
            {{ t("userAccount.actions.delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { getApiDeleteAccount } from "../../api/account";
import AppDataSection from "../../components/ui/AppDataSection.vue";
import { clearAuthSession } from "../../composables/useAuthSession";
import { getCurrentUser } from "../../composables/useCurrentUser";
import { useToast } from "../../composables/useToast";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const isDeleteDialogOpen = ref(false);
const isDeletingAccount = ref(false);
const sessionVersion = ref(0);
const currentUser = computed(() => {
  sessionVersion.value;
  return getCurrentUser();
});

const deleteAccount = async () => {
  if (!currentUser.value || isDeletingAccount.value) return;

  isDeletingAccount.value = true;

  try {
    const response = await getApiDeleteAccount();

    if (response.status < 200 || response.status >= 300) {
      toast.error("userAccount.feedback.deleteFailed");
      return;
    }

    clearAuthSession();
    sessionVersion.value += 1;
    isDeleteDialogOpen.value = false;
    toast.success("userAccount.feedback.deleteSuccess");
    await router.replace({ name: "login" });
  } catch (error) {
    toast.error("userAccount.feedback.deleteFailed");
  } finally {
    isDeletingAccount.value = false;
  }
};
</script>
