<template>
  <div class="grid gap-4">
    <section>
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.reports.submissionsEyebrow") }}
        </p>
        <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
          {{ t("trainerMemberDetails.reports.submissionsTitle") }}
        </h2>
      </div>

      <div class="grid gap-4 pt-4">
        <section>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex flex-wrap gap-2">
              <v-btn
                variant="outlined"
                color="primary"
                class="min-h-10 rounded-md px-4"
                to="/trainer/report-templates"
              >
                {{ t("trainerMemberDetails.reports.actions.manageTemplates") }}
              </v-btn>
              <v-btn
                color="primary"
                class="min-h-10 rounded-md px-4"
                @click="openRequestDialog"
              >
                {{ t("trainerMemberDetails.reports.actions.sendRequest") }}
              </v-btn>
            </div>
          </div>

          <v-progress-linear v-if="isLoadingTemplates" class="mt-4" indeterminate color="primary" />

          <div
            v-if="hasTemplatesError && !isLoadingTemplates"
            class="mt-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-8 text-center"
          >
            <p class="text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.reports.error.templates") }}
            </p>
            <v-btn class="mt-4" color="primary" variant="outlined" @click="loadTemplates">
              {{ t("trainerMemberDetails.actions.retry") }}
            </v-btn>
          </div>

          <div
            v-else-if="!isLoadingTemplates && templateOptions.length === 0"
            class="mt-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-8 text-center"
          >
            <p class="text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.reports.empty.templates") }}
            </p>
            <v-btn class="mt-4" color="primary" variant="outlined" to="/trainer/report-templates">
              {{ t("trainerMemberDetails.reports.actions.goToTemplateLibrary") }}
            </v-btn>
          </div>

          <div v-else class="mt-4 border-t border-[var(--lgym-border)] pt-4" />
        </section>

        <section>
          <v-progress-linear v-if="isLoadingSubmissions" indeterminate color="primary" />

          <div
            v-if="hasSubmissionsError && !isLoadingSubmissions"
            class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center"
          >
            <p class="text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.reports.error.submissions") }}
            </p>
            <v-btn class="mt-4" color="primary" variant="outlined" @click="loadSubmissions">
              {{ t("trainerMemberDetails.actions.retry") }}
            </v-btn>
          </div>

          <AppDataTable
            v-else
            :headers="headers"
            :items="submissions"
            :loading="isLoadingSubmissions"
            item-value="_id"
            hide-default-footer
            hover
            row-clickable
            @row-click="openSubmissionPreview"
          >
            <template #mobile>
              <div class="border-y border-[var(--lgym-border)]">
                <template v-if="submissions.length > 0">
                  <article
                    v-for="submission in submissions"
                    :key="submission._id || submission.reportRequestId || 'submission'"
                    class="cursor-pointer border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0"
                    role="button"
                    tabindex="0"
                    @click="openSubmissionPreview(submission)"
                    @keydown.enter.prevent="openSubmissionPreview(submission)"
                    @keydown.space.prevent="openSubmissionPreview(submission)"
                  >
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <h3 class="text-base font-semibold text-[var(--lgym-text)]">
                            {{ submission.request?.template?.name || t("trainerMemberDetails.reports.fallback.noTemplateName") }}
                          </h3>
                          <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                            {{ t("trainerMemberDetails.reports.meta.submittedAt") }}:
                            {{ formatDateTime(submission.submittedAt) }}
                          </p>
                        </div>

                        <v-chip color="primary" size="small" variant="outlined">
                          {{ submission.request?.status || t("trainerMemberDetails.reports.fallback.noStatus") }}
                        </v-chip>
                      </div>

                      <div class="grid gap-3">
                        <div
                          v-for="field in orderedFields(submission.request?.template?.fields)"
                          :key="field.key || field.label || 'field-answer'"
                          class="border-l-2 border-[var(--lgym-border)] pl-4"
                        >
                          <p class="text-sm font-semibold text-[var(--lgym-text)]">
                            {{ field.label || field.key }}
                          </p>
                          <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                            {{ formatAnswer(submission.answers?.[field.key || ""]) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </template>

                <div
                  v-else
                  class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8"
                >
                  {{ t("trainerMemberDetails.reports.empty.submissions") }}
                </div>
              </div>
            </template>

            <template #item.template="{ item }">
      <div class="px-4 py-4 lg:px-5">
                <p class="font-semibold text-[var(--lgym-text)]">
                  {{ toSubmission(item).request?.template?.name || t("trainerMemberDetails.reports.fallback.noTemplateName") }}
                </p>
                <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                  {{ submissionAnswerSummary(toSubmission(item)) }}
                </p>
              </div>
            </template>

            <template #item.status="{ item }">
      <div class="px-4 py-4 lg:px-5">
                <v-chip color="primary" size="small" variant="outlined">
                  {{ toSubmission(item).request?.status || t("trainerMemberDetails.reports.fallback.noStatus") }}
                </v-chip>
              </div>
            </template>

            <template #item.submittedAt="{ item }">
      <div class="px-4 py-4 text-sm text-[var(--lgym-text)] lg:px-5">
                {{ formatDateTime(toSubmission(item).submittedAt) }}
              </div>
            </template>

            <template #no-data>
              <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8">
                {{ t("trainerMemberDetails.reports.empty.submissions") }}
              </div>
            </template>
          </AppDataTable>
        </section>
      </div>

      <v-dialog v-model="isRequestDialogOpen" max-width="720">
        <v-card rounded="lg" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
          <div class="border-b border-[var(--lgym-border)] px-6 py-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
              {{ t("trainerMemberDetails.reports.requestEyebrow") }}
            </p>
            <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
              {{ t("trainerMemberDetails.reports.requestTitle") }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.reports.requestSubtitle") }}
            </p>
          </div>

      <v-card-text class="px-6 py-6">
            <div class="grid gap-5">
              <div
        class="rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]/45 px-4 py-4 sm:px-5"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="space-y-1.5">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerMemberDetails.reports.preview.title") }}
                    </p>
                    <p class="text-sm leading-6 text-[var(--lgym-text-muted)]">
                      {{
                        selectedTemplate
                          ? selectedTemplate.description || t("trainerMemberDetails.reports.fallback.noDescription")
                          : t("trainerMemberDetails.reports.preview.empty")
                      }}
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <v-chip size="small" variant="outlined" color="primary">
                      {{ t("trainerMemberDetails.reports.preview.fieldsCount", { count: selectedTemplateFieldCount }) }}
                    </v-chip>
                    <v-chip size="small" variant="outlined">
                      {{ selectedTemplate?.name || t("trainerMemberDetails.reports.fallback.noTemplateName") }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <div class="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <v-select
                  v-model="reportRequest.templateId"
                  :items="templateOptions"
                  item-title="label"
                  item-value="value"
                  :label="t('trainerMemberDetails.reports.form.template')"
                  :placeholder="t('trainerMemberDetails.reports.form.templatePlaceholder')"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="report-request-control"
                  :disabled="templateOptions.length === 0 || isCreatingRequest"
                />

                <div class="space-y-2">
                  <v-text-field
                    v-model="reportRequest.dueAt"
                    type="datetime-local"
                    :label="t('trainerMemberDetails.reports.form.dueAt')"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    class="report-request-control"
                    :disabled="isCreatingRequest"
                  />
                  <p class="text-xs leading-5 text-[var(--lgym-text-muted)]">
                    {{ t("trainerMemberDetails.reports.form.dueAtHint") }}
                  </p>
                </div>
              </div>

              <div class="grid gap-2">
                <v-textarea
                  v-model="reportRequest.note"
                  rows="4"
                  auto-grow
                  :label="t('trainerMemberDetails.reports.form.note')"
                  :placeholder="t('trainerMemberDetails.reports.form.notePlaceholder')"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="report-request-control"
                  :disabled="isCreatingRequest"
                />
                <p class="text-xs leading-5 text-[var(--lgym-text-muted)]">
                  {{ t("trainerMemberDetails.reports.form.noteHint") }}
                </p>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="justify-end gap-3 px-6 pb-6">
            <v-btn variant="outlined" color="primary" @click="closeRequestDialog">
              {{ t("trainerMemberDetails.actions.cancel") }}
            </v-btn>
            <v-btn
              color="primary"
              class="min-h-10 rounded-md px-4"
              :loading="isCreatingRequest"
              :disabled="templateOptions.length === 0"
              @click="submitReportRequest"
            >
              {{ t("trainerMemberDetails.reports.actions.sendRequest") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isPreviewDialogOpen" max-width="860">
        <v-card rounded="lg" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
          <template v-if="selectedSubmission">
            <div class="border-b border-[var(--lgym-border)] px-6 py-5">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">
                    {{ t("trainerMemberDetails.reports.preview.submissionEyebrow") }}
                  </p>
                  <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)]">
                    {{
                      selectedSubmission.request?.template?.name ||
                      t("trainerMemberDetails.reports.fallback.noTemplateName")
                    }}
                  </h3>
                  <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                    {{
                      selectedSubmission.request?.template?.description ||
                      t("trainerMemberDetails.reports.fallback.noDescription")
                    }}
                  </p>
                </div>

                <v-chip color="primary" size="small" variant="outlined">
                  {{ selectedSubmission.request?.status || t("trainerMemberDetails.reports.fallback.noStatus") }}
                </v-chip>
              </div>
            </div>

            <v-card-text class="px-6 py-6">
              <div class="grid gap-6">
                <div class="grid gap-4 rounded-xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)]/45 px-4 py-4 sm:grid-cols-2 sm:px-5">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerMemberDetails.reports.meta.status") }}
                    </p>
                    <p class="mt-2 text-sm text-[var(--lgym-text)]">
                      {{ selectedSubmission.request?.status || t("trainerMemberDetails.reports.fallback.noStatus") }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerMemberDetails.reports.meta.submittedAt") }}
                    </p>
                    <p class="mt-2 text-sm text-[var(--lgym-text)]">
                      {{ formatDateTime(selectedSubmission.submittedAt) }}
                    </p>
                  </div>

                  <div v-if="selectedSubmission.request?.dueAt">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerMemberDetails.reports.form.dueAt") }}
                    </p>
                    <p class="mt-2 text-sm text-[var(--lgym-text)]">
                      {{ formatDateTime(selectedSubmission.request?.dueAt) }}
                    </p>
                  </div>

                  <div v-if="selectedSubmission.request?.note">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                      {{ t("trainerMemberDetails.reports.form.note") }}
                    </p>
                    <p class="mt-2 whitespace-pre-wrap text-sm text-[var(--lgym-text)]">
                      {{ selectedSubmission.request?.note }}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    {{ t("trainerMemberDetails.reports.preview.answersTitle") }}
                  </h4>

                  <div class="mt-4 grid gap-4">
                    <div
                      v-for="entry in selectedSubmissionAnswerEntries"
                      :key="entry.key"
                      class="overflow-hidden rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-surface)]"
                    >
                      <div class="border-b border-[var(--lgym-border)] px-5 py-4">
                        <p class="text-sm font-semibold leading-6 text-[var(--lgym-text)]">
                          {{ entry.label }}
                        </p>
                      </div>

                      <div class="bg-[var(--lgym-surface-card)] px-5 py-4">
                        <p class="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--lgym-text-muted)]">
                          {{ entry.answer }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>

            <v-card-actions class="justify-end px-6 pb-6">
              <v-btn variant="outlined" color="primary" @click="closeSubmissionPreview">
                {{ t("trainerMemberDetails.actions.cancel") }}
              </v-btn>
            </v-card-actions>
          </template>
        </v-card>
      </v-dialog>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  getApiTrainerReportTemplates,
  getApiTrainerTraineesTraineeIdReportSubmissions,
  postApiTrainerTraineesTraineeIdReportRequests,
} from "../../../api/generated/demo";
import {
  type CreateReportRequestRequest,
  type ReportSubmissionDto,
  type ReportTemplateDto,
} from "../../../api/model";
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

const templates = ref<ReportTemplateDto[]>([]);
const submissions = ref<ReportSubmissionDto[]>([]);
const isLoadingTemplates = ref(false);
const isLoadingSubmissions = ref(false);
const hasTemplatesError = ref(false);
const hasSubmissionsError = ref(false);
const isCreatingRequest = ref(false);
const isRequestDialogOpen = ref(false);
const isPreviewDialogOpen = ref(false);
const selectedSubmission = ref<ReportSubmissionDto | null>(null);

const reportRequest = ref<CreateReportRequestRequest>({
  templateId: null,
  dueAt: null,
  note: null,
});

const templateOptions = computed(() =>
  templates.value.map((template) => ({
    label: template.name || t("trainerMemberDetails.reports.fallback.noTemplateName"),
    value: template._id || "",
  })),
);

const selectedTemplate = computed(
  () =>
    templates.value.find((template) => template._id === reportRequest.value.templateId) ?? null,
);

const selectedTemplateFieldCount = computed(
  () => orderedFields(selectedTemplate.value?.fields).length,
);

const headers = computed(() => [
  { title: t("trainerMemberDetails.reports.form.template"), key: "template", sortable: false },
  { title: t("trainerMemberDetails.reports.meta.status"), key: "status", sortable: false },
  { title: t("trainerMemberDetails.reports.meta.submittedAt"), key: "submittedAt", sortable: false },
]);

let templateToken = 0;
let submissionToken = 0;

const isEmptyListStatus = (status: number) => status === 404;

type OrderedFieldLike = {
  key?: string | null;
  label?: string | null;
  type?: string | null;
  isRequired?: boolean;
  order?: number;
};

type SubmissionAnswerEntry = {
  key: string;
  label: string;
  answer: string;
};

const orderedFields = (fields: OrderedFieldLike[] | null | undefined) =>
  [...(fields ?? [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

const toSubmission = (item: unknown) => item as ReportSubmissionDto;

const selectedSubmissionAnswerEntries = computed<SubmissionAnswerEntry[]>(() => {
  const submission = selectedSubmission.value;
  if (!submission) {
    return [];
  }

  const fields = orderedFields(submission.request?.template?.fields);
  if (fields.length > 0) {
    return fields.map((field) => ({
      key: field.key || field.label || "field-answer",
      label: field.label || field.key || t("trainerMemberDetails.reports.fallback.noTemplateName"),
      answer: formatFieldAnswer(field, submission.answers?.[field.key || ""]),
    }));
  }

  return Object.entries(submission.answers ?? {}).map(([key, value]) => ({
    key,
    label: key,
    answer: formatAnswer(value),
  }));
});

const submissionAnswerSummary = (submission: ReportSubmissionDto) => {
  const answers = Object.values(submission.answers ?? {});
  if (answers.length === 0) return t("trainerMemberDetails.reports.fallback.noAnswer");
  return formatAnswer(answers[0]);
};

const resetReportRequest = () => {
  reportRequest.value = {
    templateId: null,
    dueAt: null,
    note: null,
  };
};

const openRequestDialog = () => {
  resetReportRequest();
  isRequestDialogOpen.value = true;
};

const closeRequestDialog = () => {
  isRequestDialogOpen.value = false;
};

const openSubmissionPreview = (item: unknown) => {
  selectedSubmission.value = toSubmission(item);
  isPreviewDialogOpen.value = true;
};

const closeSubmissionPreview = () => {
  isPreviewDialogOpen.value = false;
  selectedSubmission.value = null;
};

const loadTemplates = async () => {
  const currentToken = ++templateToken;
  isLoadingTemplates.value = true;
  hasTemplatesError.value = false;

  try {
    const response = await getApiTrainerReportTemplates();

    if (currentToken !== templateToken) return;

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

    if (isEmptyListStatus(response.status)) {
      templates.value = [];
      return;
    }

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.reports.feedback.loadTemplatesFailed");
      hasTemplatesError.value = true;
      return;
    }

    templates.value = response.data ?? [];
  } catch (error) {
    if (currentToken !== templateToken) return;
    console.error(error);
    toast.error("trainerMemberDetails.reports.feedback.loadTemplatesFailed");
    hasTemplatesError.value = true;
  } finally {
    if (currentToken === templateToken) {
      isLoadingTemplates.value = false;
    }
  }
};

const loadSubmissions = async () => {
  if (!props.traineeId) return;

  const currentToken = ++submissionToken;
  isLoadingSubmissions.value = true;
  hasSubmissionsError.value = false;

  try {
    const response = await getApiTrainerTraineesTraineeIdReportSubmissions(
      props.traineeId,
    );

    if (currentToken !== submissionToken) return;

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

    if (isEmptyListStatus(response.status)) {
      submissions.value = [];
      return;
    }

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.reports.feedback.loadSubmissionsFailed");
      hasSubmissionsError.value = true;
      return;
    }

    submissions.value = response.data ?? [];
  } catch (error) {
    if (currentToken !== submissionToken) return;
    console.error(error);
    toast.error("trainerMemberDetails.reports.feedback.loadSubmissionsFailed");
    hasSubmissionsError.value = true;
  } finally {
    if (currentToken === submissionToken) {
      isLoadingSubmissions.value = false;
    }
  }
};

const createReportRequest = async () => {
  if (!reportRequest.value.templateId) {
    toast.error("trainerMemberDetails.reports.feedback.templateRequired");
    return;
  }

  isCreatingRequest.value = true;

  try {
    const response = await postApiTrainerTraineesTraineeIdReportRequests(
      props.traineeId,
      {
        templateId: reportRequest.value.templateId,
        dueAt: toUtcIsoString(reportRequest.value.dueAt),
        note: reportRequest.value.note || null,
      },
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
      else toast.error("trainerMemberDetails.reports.feedback.createRequestFailed");
      return;
    }

     toast.success("trainerMemberDetails.reports.feedback.createRequestSuccess");
      closeRequestDialog();
      resetReportRequest();
      await loadSubmissions();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.reports.feedback.createRequestFailed");
  } finally {
    isCreatingRequest.value = false;
  }
};

const submitReportRequest = async () => {
  await createReportRequest();
};

const toUtcIsoString = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
};

const formatAnswer = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return t("trainerMemberDetails.reports.fallback.noAnswer");
  }

  if (typeof value === "boolean") {
    return value
      ? t("trainerMemberDetails.reports.boolean.true")
      : t("trainerMemberDetails.reports.boolean.false");
  }

  if (typeof value === "number" || typeof value === "string") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const formatFieldAnswer = (field: OrderedFieldLike, value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return formatAnswer(value);
  }

  if (field.type === "Date" && typeof value === "string") {
    return props.formatDateTime(value);
  }

  return formatAnswer(value);
};

watch(
  () => props.traineeId,
  () => {
    templates.value = [];
    submissions.value = [];
    closeSubmissionPreview();
    void Promise.all([loadTemplates(), loadSubmissions()]);
  },
  { immediate: true },
);
</script>

<style scoped>
.report-request-control :deep(.v-field) {
  border-radius: 0.75rem;
}
</style>
