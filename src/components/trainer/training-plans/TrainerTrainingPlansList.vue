<template>
  <section class="overflow-hidden flex-1 border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
  <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="lgym-section-heading">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerTrainingPlans.list.eyebrow") }}
          </p>
          <h3 class="text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
            {{ t("trainerTrainingPlans.list.title") }}
          </h3>
          <p class="lgym-section-heading__subtitle text-sm leading-6 text-[var(--lgym-text-muted)]">
            {{ t("trainerTrainingPlans.list.subtitle") }}
          </p>
        </div>

        <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openCreateDialog">
          {{ t("trainerTrainingPlans.actions.create") }}
        </v-btn>
      </div>
    </div>

    <div>
      <div v-if="hasLoadError && !isLoadingPlans" class="px-4 py-8 text-center sm:px-5 lg:px-6">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerTrainingPlans.error.load") }}
        </p>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="loadPlans">
          {{ t("trainerTrainingPlans.actions.retry") }}
        </v-btn>
      </div>

      <AppDataTable
        v-else
        :headers="headers"
        :items="plans"
        :loading="isLoadingPlans"
        item-value="_id"
        hide-default-footer
        hover
        row-clickable
        @row-click="handleRowClick"
      >
        <template #mobile>
          <div class="border-y border-[var(--lgym-border)]">
            <template v-if="plans.length > 0">
              <article
                v-for="plan in plans"
                :key="plan._id || plan.name || 'plan'"
        class="cursor-pointer border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0 transition-colors hover:bg-[var(--lgym-table-row-hover)]"
                @click="openDetails(plan._id || '')"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-3">
                      <h4 class="truncate text-base font-semibold text-[var(--lgym-text)]">
                        {{ plan.name || t("trainerTrainingPlans.fallback.noName") }}
                      </h4>
                      <v-chip color="primary" size="small" variant="outlined">
                        {{ t("trainerTrainingPlans.status.assignable") }}
                      </v-chip>
                    </div>
                  </div>

                  <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <v-btn
                      variant="outlined"
                      color="primary"
                      class="min-h-10 rounded-md px-4"
                      :disabled="!plan._id"
                      @click.stop="openRenameDialog(plan)"
                    >
                      {{ t("trainerTrainingPlans.actions.rename") }}
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="error"
                      class="min-h-10 rounded-md px-4"
                      :disabled="!plan._id"
                      :loading="deletingPlanId === plan._id"
                      @click.stop="handleDelete(plan)"
                    >
                      {{ t("trainerTrainingPlans.actions.delete") }}
                    </v-btn>
                  </div>
                </div>
              </article>
            </template>

            <div
              v-else
              class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8"
            >
              {{ t("trainerTrainingPlans.empty.title") }}
            </div>
          </div>
        </template>

        <template #item.name="{ item }">
      <div class="px-4 py-4 lg:px-5">
            <p class="font-semibold text-[var(--lgym-text)]">
              {{ toPlan(item).name || t("trainerTrainingPlans.fallback.noName") }}
            </p>
          </div>
        </template>

        <template #item.status>
      <div class="px-4 py-4 lg:px-5">
            <v-chip color="primary" size="small" variant="outlined">
              {{ t("trainerTrainingPlans.status.assignable") }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
      <div class="flex flex-wrap items-center justify-end gap-2 px-4 py-4 lg:px-5">
            <v-btn
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              :disabled="!toPlan(item)._id"
              @click.stop="openRenameDialog(toPlan(item))"
            >
              {{ t("trainerTrainingPlans.actions.rename") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="error"
              class="min-h-10 rounded-md px-4"
              :disabled="!toPlan(item)._id"
              :loading="deletingPlanId === toPlan(item)._id"
              @click.stop="handleDelete(toPlan(item))"
            >
              {{ t("trainerTrainingPlans.actions.delete") }}
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8">
            {{ t("trainerTrainingPlans.empty.title") }}
          </div>
        </template>
      </AppDataTable>
    </div>

    <v-dialog v-model="isPlanDialogOpen" max-width="520">
      <v-card
        rounded="xl"
        class="lgym-form-shell overflow-hidden shadow-none"
      >
        <div class="lgym-form-header">
          <p class="lgym-form-eyebrow">
            {{ t("trainerTrainingPlans.list.eyebrow") }}
          </p>
          <v-card-title class="lgym-form-title px-0">
            {{
              editingPlanId
                ? t("trainerTrainingPlans.dialog.renameTitle")
                : t("trainerTrainingPlans.dialog.createTitle")
            }}
          </v-card-title>
          <p class="lgym-form-subtitle">
            {{ t("trainerTrainingPlans.form.namePlaceholder") }}
          </p>
        </div>

        <v-card-text class="lgym-form-body">
          <div class="lgym-form-section">
            <v-text-field
              v-model="planName"
              :label="t('trainerTrainingPlans.form.name')"
              :placeholder="t('trainerTrainingPlans.form.namePlaceholder')"
              density="comfortable"
              variant="outlined"
              prepend-inner-icon="mdi-pencil-outline"
              hide-details
            />
          </div>
        </v-card-text>
        <v-card-actions class="lgym-form-actions">
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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { PlanFormDto } from "../../../api/model";
import { useConfirmDialog } from "../../../composables/useConfirmDialog";
import { useTrainerTrainingPlans } from "../../../composables/useTrainerTrainingPlans";
import AppDataTable from "../../ui/AppDataTable.vue";

const { t } = useI18n();
const router = useRouter();
const { confirm } = useConfirmDialog();

const {
  plans,
  isLoadingPlans,
  hasLoadError,
  savingPlanId,
  deletingPlanId,
  loadPlans,
  savePlan,
  deletePlan,
} = useTrainerTrainingPlans();

const isPlanDialogOpen = ref(false);
const editingPlanId = ref<string | null>(null);
const editingPlanIsActive = ref<boolean | null>(false);
const planName = ref("");

const headers = computed(() => [
  { title: t("trainerTrainingPlans.form.name"), key: "name", sortable: false },
  { title: t("trainerTrainingPlans.columns.status"), key: "status", sortable: false },
  {
    title: t("trainerTrainingPlans.columns.actions"),
    key: "actions",
    sortable: false,
    align: "end" as const,
  },
]);

const toPlan = (item: unknown) => item as PlanFormDto;

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

  const confirmed = await confirm({
    title: t("trainerTrainingPlans.actions.delete"),
    description: t("trainerTrainingPlans.actions.deleteConfirm", {
      name: plan.name || t("trainerTrainingPlans.fallback.noName"),
    }),
    confirmLabel: t("trainerTrainingPlans.actions.delete"),
    cancelLabel: t("trainerTrainingPlans.actions.cancel"),
    confirmColor: "error",
    isDestructive: true,
  });
  if (!confirmed) return;

  await deletePlan(planId);
};

const openDetails = async (planId: string) => {
  if (!planId.trim()) return;
  await router.push(`/trainer/training-plans/${planId}`);
};

const handleRowClick = async (item: unknown) => {
  const planId = toPlan(item)._id?.trim() ?? "";
  await openDetails(planId);
};

onMounted(async () => {
  await loadPlans();
});
</script>
