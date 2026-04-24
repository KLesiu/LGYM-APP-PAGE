<template>
  <div class="flex min-h-full min-w-0 flex-col gap-5">
    <section class="relative overflow-hidden rounded-[28px] border border-[var(--lgym-border)] bg-[linear-gradient(135deg,rgba(var(--v-theme-primary),0.14),transparent_58%),var(--lgym-surface-card)] px-5 py-5 shadow-[var(--lgym-shadow-surface)] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--v-theme-primary))]">
            {{ t("userRelationship.page.eyebrow") }}
          </p>

          <div class="space-y-3">
            <h2 class="text-3xl font-semibold tracking-tight text-[var(--lgym-text)] sm:text-[2.35rem]">
              {{ t("userRelationship.page.title") }}
            </h2>
            <p class="max-w-2xl text-sm leading-7 text-[var(--lgym-text-muted)] sm:text-[0.95rem]">
              {{ t("userRelationship.page.subtitle") }}
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <article
            v-for="stat in heroStats"
            :key="stat.label"
            class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]/88 px-4 py-4 backdrop-blur"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
              {{ stat.label }}
            </p>
            <p class="mt-3 text-base font-semibold text-[var(--lgym-text)] sm:text-lg">
              {{ stat.value }}
            </p>
            <p v-if="stat.meta" class="mt-1 text-xs leading-5 text-[var(--lgym-text-muted)]">
              {{ stat.meta }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="grid min-h-0 min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,360px)]">
      <div class="flex min-h-0 min-w-0 flex-col gap-5">
        <section class="overflow-hidden rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
          <v-progress-linear v-if="isLoading" indeterminate color="primary" />

          <div class="border-b border-[var(--lgym-border)] px-5 py-5 sm:px-6 sm:py-6">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="max-w-3xl space-y-3">
                <div class="flex flex-wrap items-center gap-3">
                  <v-chip :color="statePresentation.chipColor" variant="flat" size="small" class="font-semibold">
                    {{ statePresentation.badge }}
                  </v-chip>

                  <div
                    v-if="hasInvitationContext"
                    class="inline-flex items-center gap-2 rounded-full border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-3 py-1 text-xs font-medium text-[var(--lgym-text-muted)]"
                  >
                    <span class="inline-flex h-2 w-2 rounded-full bg-[rgb(var(--v-theme-primary))]" />
                    {{ t("userRelationship.page.invitationMode") }}
                  </div>
                </div>

                <div>
                  <h3 class="text-2xl font-semibold text-[var(--lgym-text)]">
                    {{ statePresentation.title }}
                  </h3>
                  <p class="mt-2 text-sm leading-7 text-[var(--lgym-text-muted)]">
                    {{ statePresentation.subtitle }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <v-btn
                  v-if="viewState === 'error'"
                  color="primary"
                  variant="outlined"
                  class="min-h-11 rounded-xl px-5"
                  @click="load"
                >
                  {{ t("userRelationship.actions.retry") }}
                </v-btn>

                <template v-else-if="viewState === 'pending'">
                  <v-btn
                    color="primary"
                    class="min-h-11 rounded-xl px-5"
                    :loading="isSubmittingAccept"
                    :disabled="!isInvitationActionable"
                    @click="acceptInvitation"
                  >
                    {{ t("userRelationship.actions.accept") }}
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="secondary"
                    class="min-h-11 rounded-xl px-5"
                    :loading="isSubmittingReject"
                    :disabled="!isInvitationActionable"
                    @click="rejectInvitation"
                  >
                    {{ t("userRelationship.actions.reject") }}
                  </v-btn>
                </template>

                <v-btn
                  v-else-if="hasInvitationContext"
                  variant="outlined"
                  color="primary"
                  class="min-h-11 rounded-xl px-5"
                  @click="openBaseRelationshipView"
                >
                  {{ t("userRelationship.actions.dismissInvitationContext") }}
                </v-btn>
              </div>
            </div>
          </div>

          <div class="px-5 py-5 sm:px-6 sm:py-6">
            <div v-if="viewState === 'error'" class="rounded-2xl border border-dashed border-[var(--lgym-border)] bg-[var(--lgym-surface)] px-6 py-10 text-center">
              <div class="mx-auto flex max-w-xl flex-col items-center gap-4">
                <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lgym-note-bg)] text-[var(--lgym-text-soft)]">
                  <v-icon icon="mdi-alert-circle-outline" size="28" />
                </div>
                <div class="space-y-2">
                  <p class="text-lg font-semibold text-[var(--lgym-text)]">
                    {{ t("userRelationship.states.error.title") }}
                  </p>
                  <p class="text-sm leading-7 text-[var(--lgym-text-muted)]">
                    {{ t(errorKey || "userRelationship.feedback.loadFailed") }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="grid gap-4 lg:grid-cols-2">
              <article
                v-for="card in overviewCards"
                :key="card.label"
                class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]/88 px-5 py-5"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
                      {{ card.label }}
                    </p>
                    <p class="mt-3 text-lg font-semibold text-[var(--lgym-text)]">
                      {{ card.value }}
                    </p>
                  </div>

                  <div class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lgym-note-bg)] text-[rgb(var(--v-theme-primary))]">
                    <v-icon :icon="card.icon" size="22" />
                  </div>
                </div>

                <p class="mt-3 text-sm leading-6 text-[var(--lgym-text-muted)]">
                  {{ card.description }}
                </p>
              </article>
            </div>

            <div
              v-if="pendingInvitations.length > 0 && !hasInvitationContext"
              class="mt-5 border-t border-[var(--lgym-border)] pt-5"
            >
              <div class="mb-4 space-y-2">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
                  {{ t("userRelationship.invitations.eyebrow") }}
                </p>
                <h4 class="text-lg font-semibold text-[var(--lgym-text)]">
                  {{ t("userRelationship.invitations.title") }}
                </h4>
              </div>

              <div class="grid gap-3">
                <article
                  v-for="invitation in pendingInvitations"
                  :key="invitation._id || invitation.code || 'invitation'"
                  class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]/88 px-5 py-5"
                >
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-[var(--lgym-text)]">
                        {{ t("userRelationship.invitations.itemTitle") }}
                      </p>
                      <p class="mt-2 break-words text-sm leading-6 text-[var(--lgym-text-muted)]">
                        {{ t("userRelationship.invitations.expiresAt") }}:
                        {{ formatDateTime(invitation.expiresAt) }}
                      </p>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row">
                      <v-btn
                        color="primary"
                        class="min-h-11 rounded-xl px-5"
                        :loading="isSubmittingAccept && activeInvitationId === invitation._id"
                        :disabled="!invitation._id || isSubmittingAccept || isSubmittingReject"
                        @click="acceptInvitation(invitation._id || '')"
                      >
                        {{ t("userRelationship.actions.accept") }}
                      </v-btn>
                      <v-btn
                        variant="outlined"
                        color="secondary"
                        class="min-h-11 rounded-xl px-5"
                        :loading="isSubmittingReject && activeInvitationId === invitation._id"
                        :disabled="!invitation._id || isSubmittingAccept || isSubmittingReject"
                        @click="rejectInvitation(invitation._id || '')"
                      >
                        {{ t("userRelationship.actions.reject") }}
                      </v-btn>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-5 py-5 shadow-[var(--lgym-shadow-surface)] sm:px-6 sm:py-6">
          <div class="grid gap-4 lg:grid-cols-2">
            <article class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]/82 px-5 py-5">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
                {{ t("userRelationship.contract.title") }}
              </p>
              <p class="mt-3 text-base font-semibold text-[var(--lgym-text)]">
                {{ t("userRelationship.contract.primaryLine") }}
              </p>
              <p class="mt-2 text-sm leading-7 text-[var(--lgym-text-muted)]">
                {{ t("userRelationship.contract.secondaryLine") }}
              </p>
            </article>

            <article class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]/82 px-5 py-5">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
                {{ t("userRelationship.page.guidanceTitle") }}
              </p>
              <ul class="mt-3 space-y-3 text-sm leading-7 text-[var(--lgym-text-muted)]">
                <li
                  v-for="point in guidancePoints"
                  :key="point"
                  class="flex items-start gap-3"
                >
                  <span class="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--v-theme-primary))]" />
                  <span>{{ point }}</span>
                </li>
              </ul>
            </article>
          </div>
        </section>
      </div>

      <aside
        v-if="sidePanelSections.length > 0"
        class="flex min-h-0 min-w-0 flex-col gap-5"
      >
        <section
          v-for="section in sidePanelSections"
          :key="section.title"
          class="rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-5 py-5 shadow-[var(--lgym-shadow-surface)] sm:px-6 sm:py-6"
        >
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-text-soft)]">
              {{ section.eyebrow }}
            </p>
            <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
              {{ section.title }}
            </h3>
          </div>

          <div class="mt-5 space-y-4">
            <div
              v-for="item in section.items"
              :key="item.label"
              class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]/82 px-4 py-4"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ item.label }}
              </p>
              <p class="mt-2 break-words text-sm font-semibold text-[var(--lgym-text)]">
                {{ item.value }}
              </p>
              <p v-if="item.meta" class="mt-1 text-xs leading-6 text-[var(--lgym-text-muted)]">
                {{ item.meta }}
              </p>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useUserTrainerRelationship } from "../../composables/useUserTrainerRelationship";

type UiTone = "success" | "warning" | "error" | "secondary" | "info";

const { t } = useI18n();

const {
  currentUser,
  invitationId,
  invitationCode,
  activeInvitationId,
  pendingInvitations,
  hasInvitationContext,
  hasKnownAccount,
  invitationStatus,
  normalizedInvitationStatus,
  isInvitationActionable,
  viewState,
  errorKey,
  isLoading,
  isSubmittingAccept,
  isSubmittingReject,
  load,
  acceptInvitation,
  rejectInvitation,
  openBaseRelationshipView,
} = useUserTrainerRelationship();

const userDisplayName = computed(() => currentUser.value?.name?.trim() || "—");
const userDisplayEmail = computed(() => currentUser.value?.email?.trim() || "—");

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const userExistsLabel = computed(() => {
  const value = invitationStatus.value?.userExists;
  if (typeof value !== "boolean") {
    return t("userRelationship.common.notAvailable");
  }

  return value
    ? t("userRelationship.common.yes")
    : t("userRelationship.common.no");
});

const statePresentation = computed(() => {
  const map: Record<string, { badge: string; title: string; subtitle: string; chipColor: UiTone }> = {
    loading: {
      badge: t("userRelationship.states.loading.badge"),
      title: t("userRelationship.states.loading.title"),
      subtitle: t("userRelationship.states.loading.subtitle"),
      chipColor: "info",
    },
    error: {
      badge: t("userRelationship.states.error.badge"),
      title: t("userRelationship.states.error.title"),
      subtitle: t("userRelationship.states.error.subtitle"),
      chipColor: "error",
    },
    empty: {
      badge: t("userRelationship.states.empty.badge"),
      title: t("userRelationship.states.empty.title"),
      subtitle: t("userRelationship.states.empty.subtitle"),
      chipColor: "secondary",
    },
    pending: {
      badge: t("userRelationship.states.pending.badge"),
      title: t("userRelationship.states.pending.title"),
      subtitle: t("userRelationship.states.pending.subtitle"),
      chipColor: "warning",
    },
    accepted: {
      badge: t("userRelationship.states.accepted.badge"),
      title: t("userRelationship.states.accepted.title"),
      subtitle: t("userRelationship.states.accepted.subtitle"),
      chipColor: "success",
    },
    rejected: {
      badge: t("userRelationship.states.rejected.badge"),
      title: t("userRelationship.states.rejected.title"),
      subtitle: t("userRelationship.states.rejected.subtitle"),
      chipColor: "error",
    },
    expired: {
      badge: t("userRelationship.states.expired.badge"),
      title: t("userRelationship.states.expired.title"),
      subtitle: t("userRelationship.states.expired.subtitle"),
      chipColor: "secondary",
    },
  };

  return map[viewState.value] ?? map.empty;
});

const heroStats = computed(() => [
  {
    label: t("userRelationship.summary.accountLabel"),
    value: hasKnownAccount.value ? userDisplayName.value : t("userRelationship.common.notAvailable"),
    meta:
      hasKnownAccount.value && userDisplayEmail.value !== "—"
        ? userDisplayEmail.value
        : t("userRelationship.summary.accountMeta"),
  },
  {
    label: t("userRelationship.summary.contractLabel"),
    value: hasInvitationContext.value || pendingInvitations.value.length > 0
      ? t("userRelationship.summary.contractWithContext")
      : t("userRelationship.summary.contractWithoutContext"),
    meta: t("userRelationship.summary.contractMeta"),
  },
  {
    label: t("userRelationship.summary.stateLabel"),
    value: statePresentation.value.badge,
    meta: t("userRelationship.summary.stateMeta"),
  },
]);

const overviewCards = computed(() => [
  {
    label: t("userRelationship.cards.status.label"),
    value: statePresentation.value.badge,
    description: statePresentation.value.subtitle,
    icon: "mdi-account-heart-outline",
  },
  {
    label: t("userRelationship.cards.actions.label"),
    value: isInvitationActionable.value
      ? t("userRelationship.cards.actions.available")
      : t("userRelationship.cards.actions.unavailable"),
    description:
      viewState.value === "pending"
        ? t("userRelationship.cards.actions.pendingDescription")
        : t("userRelationship.cards.actions.defaultDescription"),
    icon: "mdi-check-decagram-outline",
  },
  {
    label: t("userRelationship.cards.identity.label"),
    value:
      hasKnownAccount.value && userDisplayEmail.value !== "—"
        ? userDisplayEmail.value
        : userDisplayName.value,
    description: t("userRelationship.cards.identity.description"),
    icon: "mdi-account-circle-outline",
  },
  {
    label: t("userRelationship.cards.scope.label"),
    value: t("userRelationship.cards.scope.value"),
    description: t("userRelationship.cards.scope.description"),
    icon: "mdi-api",
  },
]);

const guidancePoints = computed(() => [
  t("userRelationship.page.guidance.0"),
  t("userRelationship.page.guidance.1"),
  t("userRelationship.page.guidance.2"),
]);

const sidePanelSections = computed(() => {
  const sections: Array<{
    eyebrow: string;
    title: string;
    items: Array<{ label: string; value: string; meta?: string }>;
  }> = [];

  if (hasInvitationContext.value) {
    sections.push({
      eyebrow: t("userRelationship.sidePanels.invitation.eyebrow"),
      title: t("userRelationship.sidePanels.invitation.title"),
      items: [
        {
          label: t("userRelationship.sidePanels.invitation.items.status"),
          value: normalizedInvitationStatus.value || t("userRelationship.common.notAvailable"),
          meta: t("userRelationship.sidePanels.invitation.items.statusMeta"),
        },
        {
          label: t("userRelationship.sidePanels.invitation.items.accountExists"),
          value: userExistsLabel.value,
        },
        {
          label: t("userRelationship.sidePanels.invitation.items.invitationId"),
          value: invitationId.value || t("userRelationship.common.notAvailable"),
        },
      ],
    });
  }

  if (invitationCode.value) {
    sections.push({
      eyebrow: t("userRelationship.sidePanels.context.eyebrow"),
      title: t("userRelationship.sidePanels.context.title"),
      items: [
        {
          label: t("userRelationship.sidePanels.context.items.code"),
          value: invitationCode.value,
          meta: t("userRelationship.sidePanels.context.items.codeMeta"),
        },
        {
          label: t("userRelationship.sidePanels.context.items.route"),
          value: t("userRelationship.sidePanels.context.items.routeValue"),
        },
      ],
    });
  }

  return sections;
});

onMounted(async () => {
  await load();
});

watch(
  () => [invitationId.value, invitationCode.value],
  async () => {
    await load();
  },
);
</script>
