<template>
  <section class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerTrainingPlans.list.eyebrow") }}
          </p>
          <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
            {{ t("trainerTrainingPlans.list.title") }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
            {{ t("trainerTrainingPlans.list.subtitle") }}
          </p>
        </div>

        <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openCreateDialog">
          {{ t("trainerTrainingPlans.actions.create") }}
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="isLoadingPlans" indeterminate color="primary" />

    <div class="divide-y divide-[var(--lgym-border)]">
      <div v-if="hasLoadError && !isLoadingPlans" class="px-4 py-8 text-center sm:px-5 lg:px-6">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerTrainingPlans.error.load") }}
        </p>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="loadPlans">
          {{ t("trainerTrainingPlans.actions.retry") }}
        </v-btn>
      </div>

      <div
        v-else-if="plans.length === 0"
        class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8"
      >
        {{ t("trainerTrainingPlans.empty.title") }}
      </div>

      <article
        v-for="plan in plans"
        :key="plan._id || plan.name || 'plan'"
        class="px-6 py-5 lg:px-8"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h4 class="truncate text-lg font-semibold text-[var(--lgym-text)]">
                {{ plan.name || t("trainerTrainingPlans.fallback.noName") }}
              </h4>
              <v-chip
                :color="plan.isActive ? 'success' : 'secondary'"
                size="small"
                variant="outlined"
              >
                {{
                  plan.isActive
                    ? t("trainerTrainingPlans.status.active")
                    : t("trainerTrainingPlans.status.inactive")
                }}
              </v-chip>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <v-btn
              color="primary"
              variant="tonal"
              class="min-h-10 rounded-md px-4"
              :disabled="!plan._id"
              @click="openDetails(plan._id || '')"
            >
              {{ t("trainerTrainingPlans.actions.open") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              :disabled="!plan._id"
              @click="openRenameDialog(plan)"
            >
              {{ t("trainerTrainingPlans.actions.rename") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              :disabled="!plan._id"
              :loading="settingActivePlanId === plan._id"
              @click="handleSetActive(plan)"
            >
              {{ t("trainerTrainingPlans.actions.setActive") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              :disabled="!plan._id"
              :loading="sharingPlanId === plan._id"
              @click="handleShare(plan._id || '')"
            >
              {{ t("trainerTrainingPlans.actions.share") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="error"
              class="min-h-10 rounded-md px-4"
              :disabled="!plan._id"
              :loading="deletingPlanId === plan._id"
              @click="handleDelete(plan)"
            >
              {{ t("trainerTrainingPlans.actions.delete") }}
            </v-btn>
          </div>
        </div>

        <div v-if="shareStateByPlanId[plan._id || '']" class="mt-4 rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerTrainingPlans.share.codeLabel") }}
              </p>
              <p class="mt-2 break-all font-mono text-sm font-semibold text-[var(--lgym-text)]">
                {{ shareStateByPlanId[plan._id || ''] }}
              </p>
            </div>
            <v-btn variant="outlined" color="primary" class="min-h-10 rounded-md px-4" @click="copyShareCode(shareStateByPlanId[plan._id || ''] || '')">
              {{ t("trainerTrainingPlans.share.copy") }}
            </v-btn>
          </div>
        </div>
      </article>
    </div>

    <v-dialog v-model="isPlanDialogOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-lg font-semibold">
          {{
            editingPlanId
              ? t("trainerTrainingPlans.dialog.renameTitle")
              : t("trainerTrainingPlans.dialog.createTitle")
          }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="planName"
            :label="t('trainerTrainingPlans.form.name')"
            :placeholder="t('trainerTrainingPlans.form.namePlaceholder')"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-6">
          <v-btn variant="text" @click="isPlanDialogOpen = false">
            {{ t("trainerTrainingPlans.actions.cancel") }}
          </v-btn>
          <v-btn color="primary" :loading="Boolean(savingPlanId)" @click="handleSavePlan">
            {{ t("trainerTrainingPlans.actions.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { PlanFormDto } from "../../../api/model";
import { useToast } from "../../../composables/useToast";
import { useTrainerTrainingPlans } from "../../../composables/useTrainerTrainingPlans";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const {
  plans,
  isLoadingPlans,
  hasLoadError,
  savingPlanId,
  deletingPlanId,
  settingActivePlanId,
  sharingPlanId,
  loadPlans,
  savePlan,
  deletePlan,
  setActivePlan,
  sharePlan,
} = useTrainerTrainingPlans();

const isPlanDialogOpen = ref(false);
const editingPlanId = ref<string | null>(null);
const editingPlanIsActive = ref<boolean | null>(false);
const planName = ref("");
const shareStateByPlanId = ref<Record<string, string>>({});

const openCreateDialog = () => {
  editingPlanId.value = null;
  editingPlanIsActive.value = false;
  planName.value = "";
  isPlanDialogOpen.value = true;
};

const openRenameDialog = (plan: PlanFormDto) => {
  editingPlanId.value = plan._id?.trim() || null;
  editingPlanIsActive.value = plan.isActive ?? false;
  planName.value = plan.name ?? "";
  isPlanDialogOpen.value = true;
};

const handleSavePlan = async () => {
  const success = await savePlan({
    planId: editingPlanId.value,
    name: planName.value,
    isActive: editingPlanIsActive.value,
  });
  if (!success) return;
  isPlanDialogOpen.value = false;
};

const handleDelete = async (plan: PlanFormDto) => {
  const planId = plan._id?.trim();
  if (!planId) return;

  const confirmed = window.confirm(
    t("trainerTrainingPlans.actions.deleteConfirm", {
      name: plan.name || t("trainerTrainingPlans.fallback.noName"),
    }),
  );
  if (!confirmed) return;

  await deletePlan(planId);
};

const handleSetActive = async (plan: PlanFormDto) => {
  const planId = plan._id?.trim();
  if (!planId || plan.isActive) return;

  await setActivePlan(planId);
};

const handleShare = async (planId: string) => {
  const response = await sharePlan(planId);
  const shareCode = response?.shareCode?.trim();
  if (!shareCode) return;

  shareStateByPlanId.value = {
    ...shareStateByPlanId.value,
    [planId]: shareCode,
  };
};

const copyShareCode = async (shareCode: string) => {
  if (!shareCode) return;

  try {
    await navigator.clipboard.writeText(shareCode);
    toast.success("trainerTrainingPlans.feedback.copyShareCodeSuccess");
  } catch (error) {
    console.error(error);
    toast.error("trainerTrainingPlans.feedback.copyShareCodeFailed");
  }
};

const openDetails = async (planId: string) => {
  if (!planId.trim()) return;
  await router.push(`/trainer/training-plans/${planId}`);
};

onMounted(async () => {
  await loadPlans();
});
</script>
