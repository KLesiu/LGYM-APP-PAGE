<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <v-card class="overflow-hidden rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
              {{ t("trainerMemberDetails.plans.eyebrow") }}
            </p>
            <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
              {{ t("trainerMemberDetails.plans.title") }}
            </h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.plans.subtitle") }}
            </p>
          </div>

          <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openCreateDialog">
            {{ t("trainerMemberDetails.plans.actions.create") }}
          </v-btn>
        </div>
      </div>

      <v-progress-linear v-if="isLoading" indeterminate color="primary" />

      <v-card-text class="flex flex-col gap-0 px-4 py-0 sm:px-5 lg:px-6">
        <div v-if="hasError && !isLoading" class="my-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.plans.error.subtitle") }}
          </p>
          <v-btn class="mt-4" color="primary" variant="outlined" @click="loadPlans">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <div v-else-if="plans.length === 0" class="my-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.plans.empty.title") }}
        </div>

        <article
          v-for="plan in plans"
          :key="plan._id || plan.name || 'plan'"
          class="border-b border-[var(--lgym-border)] py-4 last:border-b-0"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                  {{ plan.name || t("trainerMemberDetails.plans.fallback.noName") }}
                </h3>
                <v-chip v-if="plan.isActive" color="success" size="small">
                  {{ t("trainerMemberDetails.plans.badges.active") }}
                </v-chip>
              </div>
              <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                {{ t("trainerMemberDetails.plans.meta.createdAt") }}:
                {{ formatDateTime(plan.createdAt) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <v-btn
                color="primary"
                variant="tonal"
                class="min-h-10 rounded-md px-4"
                :disabled="plan.isActive || !plan._id"
                :loading="assigningPlanId === plan._id"
                @click="assignPlan(plan)"
              >
                {{ t("trainerMemberDetails.plans.actions.assign") }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="primary"
                class="min-h-10 rounded-md px-4"
                :disabled="!plan._id"
                @click="openRenameDialog(plan)"
              >
                {{ t("trainerMemberDetails.plans.actions.rename") }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="error"
                class="min-h-10 rounded-md px-4"
                :disabled="!plan._id"
                :loading="deletingPlanId === plan._id"
                @click="deletePlan(plan)"
              >
                {{ t("trainerMemberDetails.plans.actions.delete") }}
              </v-btn>
            </div>
          </div>
        </article>

        <div class="flex justify-end py-4">
          <v-btn
            variant="outlined"
            color="warning"
            class="min-h-10 rounded-md px-4"
            :disabled="!activePlan || isUnassigning"
            :loading="isUnassigning"
            @click="unassignPlan"
          >
            {{ t("trainerMemberDetails.plans.actions.unassign") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="isPlanDialogOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-lg font-semibold">
          {{
            editingPlanId
              ? t("trainerMemberDetails.plans.dialog.renameTitle")
              : t("trainerMemberDetails.plans.dialog.createTitle")
          }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="planName"
            :label="t('trainerMemberDetails.plans.form.name')"
            :placeholder="t('trainerMemberDetails.plans.form.namePlaceholder')"
          />
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-6">
          <v-btn variant="text" @click="isPlanDialogOpen = false">
            {{ t("trainerMemberDetails.actions.cancel") }}
          </v-btn>
          <v-btn color="primary" :loading="isSavingPlan" @click="savePlan">
            {{ t("trainerMemberDetails.actions.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  getApiTrainerTraineesTraineeIdPlans,
  postApiTrainerTraineesTraineeIdPlans,
  postApiTrainerTraineesTraineeIdPlansPlanIdAssign,
  postApiTrainerTraineesTraineeIdPlansPlanIdDelete,
  postApiTrainerTraineesTraineeIdPlansPlanIdUpdate,
  postApiTrainerTraineesTraineeIdPlansUnassign,
} from "../../../api/generated/demo";
import type { TrainerManagedPlanDto } from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";

const props = defineProps<{
  traineeId: string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const plans = ref<TrainerManagedPlanDto[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const isPlanDialogOpen = ref(false);
const planName = ref("");
const editingPlanId = ref<string | null>(null);
const isSavingPlan = ref(false);
const assigningPlanId = ref<string | null>(null);
const deletingPlanId = ref<string | null>(null);
const isUnassigning = ref(false);

const activePlan = computed(() => plans.value.find((item) => item.isActive) ?? null);

let requestToken = 0;

const loadPlans = async () => {
  if (!props.traineeId) return;

  const currentToken = ++requestToken;
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await getApiTrainerTraineesTraineeIdPlans(props.traineeId);

    if (currentToken !== requestToken) return;

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        `/trainer/members/${props.traineeId}`,
      )
    ) {
      return;
    }

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.plans.feedback.loadFailed");
      hasError.value = true;
      return;
    }

    plans.value = response.data ?? [];
  } catch (error) {
    if (currentToken !== requestToken) return;

    console.error(error);
    toast.error("trainerMemberDetails.plans.feedback.loadFailed");
    hasError.value = true;
  } finally {
    if (currentToken === requestToken) {
      isLoading.value = false;
    }
  }
};

const openCreateDialog = () => {
  editingPlanId.value = null;
  planName.value = "";
  isPlanDialogOpen.value = true;
};

const openRenameDialog = (plan: TrainerManagedPlanDto) => {
  editingPlanId.value = plan._id ?? null;
  planName.value = plan.name ?? "";
  isPlanDialogOpen.value = true;
};

const savePlan = async () => {
  const trimmedName = planName.value.trim();
  if (!trimmedName) {
    toast.error("trainerMemberDetails.plans.feedback.nameRequired");
    return;
  }

  isSavingPlan.value = true;

  try {
    const response = editingPlanId.value
      ? await postApiTrainerTraineesTraineeIdPlansPlanIdUpdate(
          props.traineeId,
          editingPlanId.value,
          { name: trimmedName },
        )
      : await postApiTrainerTraineesTraineeIdPlans(props.traineeId, {
          name: trimmedName,
        });

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        `/trainer/members/${props.traineeId}`,
      )
    ) {
      return;
    }

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else {
        toast.error(
          editingPlanId.value
            ? "trainerMemberDetails.plans.feedback.renameFailed"
            : "trainerMemberDetails.plans.feedback.createFailed",
        );
      }
      return;
    }

    toast.success(
      editingPlanId.value
        ? "trainerMemberDetails.plans.feedback.renameSuccess"
        : "trainerMemberDetails.plans.feedback.createSuccess",
    );
    isPlanDialogOpen.value = false;
    await loadPlans();
  } catch (error) {
    console.error(error);
    toast.error(
      editingPlanId.value
        ? "trainerMemberDetails.plans.feedback.renameFailed"
        : "trainerMemberDetails.plans.feedback.createFailed",
    );
  } finally {
    isSavingPlan.value = false;
  }
};

const assignPlan = async (plan: TrainerManagedPlanDto) => {
  const planId = plan._id?.trim();
  if (!planId) return;

  assigningPlanId.value = planId;

  try {
    const response = await postApiTrainerTraineesTraineeIdPlansPlanIdAssign(
      props.traineeId,
      planId,
    );

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        `/trainer/members/${props.traineeId}`,
      )
    ) {
      return;
    }

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.plans.feedback.assignFailed");
      return;
    }

    toast.success("trainerMemberDetails.plans.feedback.assignSuccess");
    await loadPlans();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.plans.feedback.assignFailed");
  } finally {
    assigningPlanId.value = null;
  }
};

const unassignPlan = async () => {
  isUnassigning.value = true;

  try {
    const response = await postApiTrainerTraineesTraineeIdPlansUnassign(
      props.traineeId,
    );

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        `/trainer/members/${props.traineeId}`,
      )
    ) {
      return;
    }

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.plans.feedback.unassignFailed");
      return;
    }

    toast.success("trainerMemberDetails.plans.feedback.unassignSuccess");
    await loadPlans();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.plans.feedback.unassignFailed");
  } finally {
    isUnassigning.value = false;
  }
};

const deletePlan = async (plan: TrainerManagedPlanDto) => {
  const planId = plan._id?.trim();
  if (!planId) return;

  const confirmed = window.confirm(
    t("trainerMemberDetails.plans.actions.deleteConfirm", {
      name: plan.name || t("trainerMemberDetails.plans.fallback.noName"),
    }),
  );
  if (!confirmed) return;

  deletingPlanId.value = planId;

  try {
    const response = await postApiTrainerTraineesTraineeIdPlansPlanIdDelete(
      props.traineeId,
      planId,
    );

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        `/trainer/members/${props.traineeId}`,
      )
    ) {
      return;
    }

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.plans.feedback.deleteFailed");
      return;
    }

    toast.success("trainerMemberDetails.plans.feedback.deleteSuccess");
    await loadPlans();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.plans.feedback.deleteFailed");
  } finally {
    deletingPlanId.value = null;
  }
};

watch(
  () => props.traineeId,
  () => {
    plans.value = [];
    void loadPlans();
  },
  { immediate: true },
);
</script>
