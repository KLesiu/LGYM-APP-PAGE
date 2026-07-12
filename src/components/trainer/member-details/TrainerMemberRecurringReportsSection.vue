<template>
  <section class="grid gap-4">
    <div class="flex flex-wrap items-center justify-end gap-2">
        <v-chip size="small" color="success" variant="outlined" class="font-semibold">
          {{ t("trainerMemberDetails.reports.recurring.status.active") }} · {{ activeAssignmentsCount }}
        </v-chip>
        <v-chip size="small" color="warning" variant="outlined" class="font-semibold">
          {{ t("trainerMemberDetails.reports.recurring.status.paused") }} · {{ pausedAssignmentsCount }}
        </v-chip>
        <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openCreateDialog">
          {{ t("trainerMemberDetails.reports.recurring.actions.create") }}
        </v-btn>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" />

    <div
      v-else-if="hasError"
      class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-8 text-center"
    >
      <p class="text-sm text-[var(--lgym-text-muted)]">
        {{ t("trainerMemberDetails.reports.recurring.error.load") }}
      </p>
      <v-btn class="mt-4" color="primary" variant="outlined" @click="loadAssignments">
        {{ t("trainerMemberDetails.actions.retry") }}
      </v-btn>
    </div>

    <AppDataTable
      v-else
      :headers="headers"
      :items="sortedAssignments"
      :loading="isLoading"
      item-value="_id"
      hide-default-footer
      hover
      density="compact"
    >
      <template #mobile>
        <div class="border-y border-[var(--lgym-border)]">
          <template v-if="sortedAssignments.length > 0">
            <article
              v-for="assignment in sortedAssignments"
              :key="assignment._id"
              class="border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <h4 class="truncate text-sm font-semibold text-[var(--lgym-text)]">
                    {{ assignment.template?.name || t("trainerMemberDetails.reports.fallback.noTemplateName") }}
                  </h4>
                  <p class="mt-1 text-xs text-[var(--lgym-text-muted)]">
                    {{ formatInterval(assignment.intervalValue, assignment.intervalUnit) }}
                  </p>
                </div>

                <v-chip :color="getAssignmentStatusColor(assignment)" size="small" :variant="assignment.isActive ? 'flat' : 'outlined'" class="font-semibold">
                  {{ getAssignmentStatusLabel(assignment) }}
                </v-chip>
              </div>

              <div class="mt-3 grid gap-2 text-xs text-[var(--lgym-text-muted)]">
                <p>
                  <span class="font-semibold text-[var(--lgym-text)]">{{ t("trainerMemberDetails.reports.recurring.meta.nextEligibleAt") }}:</span>
                  {{ formatAssignmentNextEligible(assignment) }}
                </p>
                <p>
                  <span class="font-semibold text-[var(--lgym-text)]">{{ t("trainerMemberDetails.reports.recurring.meta.currentRequest") }}:</span>
                  {{ assignment.currentReportRequest?.status || t("trainerMemberDetails.reports.recurring.fallback.noCurrentRequest") }}
                </p>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <v-btn variant="outlined" color="primary" size="small" @click="openEditDialog(assignment)">
                  {{ t("trainerMemberDetails.reports.recurring.actions.edit") }}
                </v-btn>
                <v-btn
                  v-if="assignment.isActive"
                  variant="outlined"
                  color="warning"
                  size="small"
                  :loading="busyAssignmentId === assignment._id && busyAction === 'pause'"
                  @click="changeState('pause', assignment)"
                >
                  {{ t("trainerMemberDetails.reports.recurring.actions.pause") }}
                </v-btn>
                <v-btn
                  v-else
                  variant="outlined"
                  color="success"
                  size="small"
                  :loading="busyAssignmentId === assignment._id && busyAction === 'resume'"
                  @click="changeState('resume', assignment)"
                >
                  {{ t("trainerMemberDetails.reports.recurring.actions.resume") }}
                </v-btn>
              </div>
            </article>
          </template>

          <div v-else class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8">
            {{ t("trainerMemberDetails.reports.recurring.empty") }}
          </div>
        </div>
      </template>

      <template #item.template="{ item }">
        <div class="px-4 py-4 lg:px-5">
          <p class="font-semibold text-[var(--lgym-text)]">
            {{ toAssignment(item).template?.name || t("trainerMemberDetails.reports.fallback.noTemplateName") }}
          </p>
          <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
            {{ toAssignment(item).note || t("trainerMemberDetails.reports.fallback.noDescription") }}
          </p>
        </div>
      </template>

      <template #item.interval="{ item }">
        <div class="px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
          {{ formatInterval(toAssignment(item).intervalValue, toAssignment(item).intervalUnit) }}
        </div>
      </template>

      <template #item.status="{ item }">
        <div class="px-4 py-4 lg:px-5">
          <v-chip
            :color="getAssignmentStatusColor(toAssignment(item))"
            size="small"
            :variant="toAssignment(item).isActive ? 'flat' : 'outlined'"
            class="font-semibold"
          >
            {{ getAssignmentStatusLabel(toAssignment(item)) }}
          </v-chip>
        </div>
      </template>

      <template #item.nextEligibleAt="{ item }">
        <div class="px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
          {{ formatAssignmentNextEligible(toAssignment(item)) }}
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="flex flex-wrap gap-2 px-4 py-4 lg:px-5">
          <v-btn variant="outlined" color="primary" size="small" @click="openEditDialog(toAssignment(item))">
            {{ t("trainerMemberDetails.reports.recurring.actions.edit") }}
          </v-btn>
          <v-btn
            v-if="toAssignment(item).isActive"
            variant="outlined"
            color="warning"
            size="small"
            :loading="busyAssignmentId === toAssignment(item)._id && busyAction === 'pause'"
            @click="changeState('pause', toAssignment(item))"
          >
            {{ t("trainerMemberDetails.reports.recurring.actions.pause") }}
          </v-btn>
          <v-btn
            v-else
            variant="outlined"
            color="success"
            size="small"
            :loading="busyAssignmentId === toAssignment(item)._id && busyAction === 'resume'"
            @click="changeState('resume', toAssignment(item))"
          >
            {{ t("trainerMemberDetails.reports.recurring.actions.resume") }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="error"
            size="small"
            :loading="busyAssignmentId === toAssignment(item)._id && busyAction === 'delete'"
            @click="changeState('delete', toAssignment(item))"
          >
            {{ t("trainerMemberDetails.reports.recurring.actions.delete") }}
          </v-btn>
        </div>
      </template>

      <template #no-data>
        <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8">
          {{ t("trainerMemberDetails.reports.recurring.empty") }}
        </div>
      </template>
    </AppDataTable>

    <v-dialog v-model="isDialogOpen" max-width="720">
      <v-card rounded="lg" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
        <div class="border-b border-[var(--lgym-border)] px-6 py-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
            {{ t("trainerMemberDetails.reports.recurring.dialog.eyebrow") }}
          </p>
          <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
            {{ editedAssignmentId ? t("trainerMemberDetails.reports.recurring.dialog.editTitle") : t("trainerMemberDetails.reports.recurring.dialog.createTitle") }}
          </h3>
        </div>

        <v-card-text class="px-6 py-6">
          <div class="grid gap-5">
            <v-select
              v-model="form.templateId"
              :items="templateOptions"
              item-title="label"
              item-value="value"
              :label="t('trainerMemberDetails.reports.form.template')"
              density="comfortable"
              variant="outlined"
              hide-details
              :disabled="isSubmitting"
            />

            <div class="grid gap-5 sm:grid-cols-2">
              <v-text-field
                v-model.number="form.intervalValue"
                type="number"
                min="1"
                :label="t('trainerMemberDetails.reports.recurring.form.intervalValue')"
                density="comfortable"
                variant="outlined"
                hide-details
                :disabled="isSubmitting"
              />

              <v-select
                v-model="form.intervalUnit"
                :items="intervalUnits"
                item-title="label"
                item-value="value"
                :label="t('trainerMemberDetails.reports.recurring.form.intervalUnit')"
                density="comfortable"
                variant="outlined"
                hide-details
                :disabled="isSubmitting"
              />
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <v-text-field
                v-model="form.startsAt"
                type="datetime-local"
                :label="t('trainerMemberDetails.reports.recurring.form.startsAt')"
                density="comfortable"
                variant="outlined"
                hide-details
                :disabled="isSubmitting"
              />
              <v-text-field
                v-model="form.endsAt"
                type="datetime-local"
                :label="t('trainerMemberDetails.reports.recurring.form.endsAt')"
                density="comfortable"
                variant="outlined"
                hide-details
                :disabled="isSubmitting"
              />
            </div>

            <v-textarea
              v-model="form.note"
              rows="3"
              auto-grow
              :label="t('trainerMemberDetails.reports.form.note')"
              density="comfortable"
              variant="outlined"
              hide-details
              :disabled="isSubmitting"
            />
          </div>
        </v-card-text>

        <v-card-actions class="justify-end gap-3 px-6 pb-6">
          <v-btn variant="outlined" color="primary" @click="closeDialog">
            {{ t("trainerMemberDetails.actions.cancel") }}
          </v-btn>
          <v-btn color="primary" :loading="isSubmitting" @click="submitAssignment">
            {{ editedAssignmentId ? t("trainerMemberDetails.reports.recurring.actions.save") : t("trainerMemberDetails.reports.recurring.actions.create") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { getApiTrainerReportTemplates } from "../../../api/generated/demo";
import type { ReportTemplateDto } from "../../../api/model";
import {
  getRecurringReportAssignments,
  postRecurringReportAssignment,
  postRecurringReportAssignmentDelete,
  postRecurringReportAssignmentPause,
  postRecurringReportAssignmentResume,
  postRecurringReportAssignmentUpdate,
  type RecurringReportAssignmentDto,
  type RecurringReportIntervalUnit,
} from "../../../api/trainerRecurringReportAssignments";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";
import AppDataTable from "../../ui/AppDataTable.vue";

const props = defineProps<{
  traineeId: string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const assignments = ref<RecurringReportAssignmentDto[]>([]);
const templates = ref<ReportTemplateDto[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const isDialogOpen = ref(false);
const isSubmitting = ref(false);
const editedAssignmentId = ref<string | null>(null);
const busyAssignmentId = ref<string | null>(null);
const busyAction = ref<"pause" | "resume" | "delete" | null>(null);

const form = ref({
  templateId: "",
  intervalValue: 1,
  intervalUnit: "Week" as RecurringReportIntervalUnit,
  startsAt: "",
  endsAt: "",
  note: "",
});

const templateOptions = computed(() =>
  templates.value.map((template) => ({
    label: template.name || t("trainerMemberDetails.reports.fallback.noTemplateName"),
    value: template._id || "",
  })),
);

const intervalUnits = computed(() => [
  { value: "Day" as const, label: t("trainerMemberDetails.reports.recurring.units.day") },
  { value: "Week" as const, label: t("trainerMemberDetails.reports.recurring.units.week") },
  { value: "Month" as const, label: t("trainerMemberDetails.reports.recurring.units.month") },
]);

const headers = computed(() => [
  { title: t("trainerMemberDetails.reports.form.template"), key: "template", sortable: false },
  { title: t("trainerMemberDetails.reports.recurring.form.intervalUnit"), key: "interval", sortable: false },
  { title: t("trainerMemberDetails.reports.meta.status"), key: "status", sortable: false },
  { title: t("trainerMemberDetails.reports.recurring.meta.nextEligibleAt"), key: "nextEligibleAt", sortable: false },
  { title: t("trainerMemberDetails.reports.actions.manageTemplates"), key: "actions", sortable: false },
]);

const sortedAssignments = computed(() =>
  [...assignments.value].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    const leftDate = left.nextEligibleAt || left.startsAt || "";
    const rightDate = right.nextEligibleAt || right.startsAt || "";
    return leftDate.localeCompare(rightDate);
  }),
);

const activeAssignmentsCount = computed(
  () => assignments.value.filter((assignment) => assignment.isActive).length,
);

const pausedAssignmentsCount = computed(
  () => assignments.value.filter((assignment) => !assignment.isActive).length,
);

const toAssignment = (item: unknown) => item as RecurringReportAssignmentDto;

const getAssignmentStatusLabel = (assignment: RecurringReportAssignmentDto) =>
  assignment.isActive
    ? t("trainerMemberDetails.reports.recurring.status.active")
    : t("trainerMemberDetails.reports.recurring.status.paused");

const getAssignmentStatusColor = (assignment: RecurringReportAssignmentDto) =>
  assignment.isActive ? "success" : "warning";

const formatAssignmentNextEligible = (assignment: RecurringReportAssignmentDto) =>
  assignment.nextEligibleAt
    ? formatDateTime(assignment.nextEligibleAt)
    : t("trainerMemberDetails.reports.recurring.fallback.awaitingFeedback");

const resetForm = () => {
  form.value = {
    templateId: "",
    intervalValue: 1,
    intervalUnit: "Week",
    startsAt: "",
    endsAt: "",
    note: "",
  };
  editedAssignmentId.value = null;
};

const toInputDateTime = (value: string | null | undefined) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoOrNull = (value: string) => {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const loadTemplates = async () => {
  const response = await getApiTrainerReportTemplates();
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

  templates.value = response.status === 200 ? response.data ?? [] : [];
};

const loadAssignments = async () => {
  if (!props.traineeId) {
    assignments.value = [];
    return;
  }

  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await getRecurringReportAssignments(props.traineeId);
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
      hasError.value = true;
      assignments.value = [];
      return;
    }

    assignments.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const openCreateDialog = () => {
  resetForm();
  form.value.startsAt = toInputDateTime(new Date().toISOString());
  isDialogOpen.value = true;
};

const openEditDialog = (assignment: RecurringReportAssignmentDto) => {
  editedAssignmentId.value = assignment._id;
  form.value = {
    templateId: assignment.templateId,
    intervalValue: assignment.intervalValue,
    intervalUnit: assignment.intervalUnit,
    startsAt: toInputDateTime(assignment.startsAt),
    endsAt: toInputDateTime(assignment.endsAt),
    note: assignment.note ?? "",
  };
  isDialogOpen.value = true;
};

const closeDialog = () => {
  if (isSubmitting.value) return;
  isDialogOpen.value = false;
  resetForm();
};

const formatInterval = (intervalValue: number, intervalUnit: RecurringReportIntervalUnit) =>
  t(`trainerMemberDetails.reports.recurring.interval.${intervalUnit.toLowerCase()}`, {
    count: intervalValue,
    value: intervalValue,
  });

const submitAssignment = async () => {
  const startsAt = toIsoOrNull(form.value.startsAt);
  if (!form.value.templateId || !startsAt || form.value.intervalValue <= 0) {
    toast.error("trainerMemberDetails.reports.recurring.feedback.invalidForm");
    return;
  }

  isSubmitting.value = true;

  const payload = {
    templateId: form.value.templateId,
    intervalValue: form.value.intervalValue,
    intervalUnit: form.value.intervalUnit,
    startsAt,
    endsAt: toIsoOrNull(form.value.endsAt),
    note: form.value.note.trim() || null,
  };

  try {
    const response = editedAssignmentId.value
      ? await postRecurringReportAssignmentUpdate(props.traineeId, editedAssignmentId.value, payload)
      : await postRecurringReportAssignment(props.traineeId, payload);

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

    if (response.status !== (editedAssignmentId.value ? 200 : 201)) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.reports.recurring.feedback.saveFailed");
      return;
    }

    toast.success(
      editedAssignmentId.value
        ? "trainerMemberDetails.reports.recurring.feedback.updateSuccess"
        : "trainerMemberDetails.reports.recurring.feedback.createSuccess",
    );
    isDialogOpen.value = false;
    resetForm();
    await loadAssignments();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.reports.recurring.feedback.saveFailed");
  } finally {
    isSubmitting.value = false;
  }
};

const changeState = async (action: "pause" | "resume" | "delete", assignment: RecurringReportAssignmentDto) => {
  busyAssignmentId.value = assignment._id;
  busyAction.value = action;

  try {
    const response =
      action === "pause"
        ? await postRecurringReportAssignmentPause(props.traineeId, assignment._id)
        : action === "resume"
          ? await postRecurringReportAssignmentResume(props.traineeId, assignment._id)
          : await postRecurringReportAssignmentDelete(props.traineeId, assignment._id);

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
      else toast.error("trainerMemberDetails.reports.recurring.feedback.saveFailed");
      return;
    }

    toast.success(`trainerMemberDetails.reports.recurring.feedback.${action}Success`);
    await loadAssignments();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.reports.recurring.feedback.saveFailed");
  } finally {
    busyAssignmentId.value = null;
    busyAction.value = null;
  }
};

watch(
  () => props.traineeId,
  async () => {
    await Promise.all([loadTemplates(), loadAssignments()]);
  },
  { immediate: true },
);

const formatDateTime = (value: string | null | undefined) => props.formatDateTime(value);
</script>
