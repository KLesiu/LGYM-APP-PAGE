<template>
  <div class="grid gap-4">
    <v-card class="overflow-hidden rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
      <div class="border-b border-[var(--lgym-border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.reports.submissionsEyebrow") }}
        </p>
        <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
          {{ t("trainerMemberDetails.reports.submissionsTitle") }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.reports.submissionsSubtitle") }}
        </p>
      </div>

      <v-card-text class="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                {{ t("trainerMemberDetails.reports.requestTitle") }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                {{ t("trainerMemberDetails.reports.requestSubtitle") }}
              </p>
            </div>

            <v-btn variant="outlined" color="primary" class="min-h-10 rounded-md px-4" to="/trainer/report-templates">
              {{ t("trainerMemberDetails.reports.actions.manageTemplates") }}
            </v-btn>
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

          <div v-else class="mt-4 grid gap-3 border-t border-[var(--lgym-border)] pt-4">
            <v-select
              v-model="reportRequest.templateId"
              :items="templateOptions"
              item-title="label"
              item-value="value"
              :label="t('trainerMemberDetails.reports.form.template')"
            />
            <v-text-field
              v-model="reportRequest.dueAt"
              type="datetime-local"
              :label="t('trainerMemberDetails.reports.form.dueAt')"
            />
            <v-textarea
              v-model="reportRequest.note"
              rows="3"
              :label="t('trainerMemberDetails.reports.form.note')"
            />

            <div class="flex justify-end">
                <v-btn color="primary" class="min-h-10 rounded-md px-4" :loading="isCreatingRequest" @click="createReportRequest">
                {{ t("trainerMemberDetails.reports.actions.sendRequest") }}
              </v-btn>
            </div>
          </div>
        </div>

        <v-progress-linear v-if="isLoadingSubmissions" indeterminate color="primary" />

        <div v-if="hasSubmissionsError && !isLoadingSubmissions" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
          <p class="text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.reports.error.submissions") }}
          </p>
          <v-btn class="mt-4" color="primary" variant="outlined" @click="loadSubmissions">
            {{ t("trainerMemberDetails.actions.retry") }}
          </v-btn>
        </div>

        <template v-else>
          <article
            v-for="submission in submissions"
            :key="submission._id || submission.reportRequestId || 'submission'"
            class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] p-4"
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                    {{ submission.request?.template?.name || t("trainerMemberDetails.reports.fallback.noTemplateName") }}
                  </h3>
                  <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                    {{ t("trainerMemberDetails.reports.meta.submittedAt") }}:
                    {{ formatDateTime(submission.submittedAt) }}
                  </p>
                </div>
                <v-chip color="primary" variant="outlined">
                  {{ submission.request?.status || t("trainerMemberDetails.reports.fallback.noStatus") }}
                </v-chip>
              </div>

              <div class="grid gap-3">
                <div
                  v-for="field in orderedFields(submission.request?.template?.fields)"
                  :key="field.key || field.label || 'field-answer'"
                   class="rounded-md border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] p-4"
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

          <div v-if="submissions.length === 0" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.reports.empty.submissions") }}
          </div>
        </template>
      </v-card-text>
    </v-card>
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

let templateToken = 0;
let submissionToken = 0;

type OrderedFieldLike = {
  key?: string | null;
  label?: string | null;
  type?: string | null;
  isRequired?: boolean;
  order?: number;
};

const orderedFields = (fields: OrderedFieldLike[] | null | undefined) =>
  [...(fields ?? [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

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
        dueAt: reportRequest.value.dueAt || null,
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
    reportRequest.value = {
      templateId: null,
      dueAt: null,
      note: null,
    };
    await loadSubmissions();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.reports.feedback.createRequestFailed");
  } finally {
    isCreatingRequest.value = false;
  }
};

const formatAnswer = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return t("trainerMemberDetails.reports.fallback.noAnswer");
  }

  if (typeof value === "boolean") {
    return value ? t("trainerMemberDetails.reports.boolean.true") : t("trainerMemberDetails.reports.boolean.false");
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

watch(
  () => props.traineeId,
  () => {
    templates.value = [];
    submissions.value = [];
    void Promise.all([loadTemplates(), loadSubmissions()]);
  },
  { immediate: true },
);
</script>
