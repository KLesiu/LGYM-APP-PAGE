<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
     <div class="bg-[var(--lgym-note-bg)]/55 px-2 py-2 sm:px-3">
        <v-tabs v-model="activeReportView" color="primary" grow align-tabs="start" class="min-h-[60px]">
          <v-tab
            v-for="tab in reportViewTabs"
            :key="tab.value"
            :value="tab.value"
            class="min-h-[60px] px-4 normal-case font-semibold tracking-normal"
          >
            <div class="flex items-center gap-2">
              <v-icon :icon="tab.icon" size="18" />
              <span>{{ tab.label }}</span>
            </div>
          </v-tab>
        </v-tabs>
      </div>

    <section v-if="activeReportView === 'recurring'" class="min-h-0 min-w-0">
      <TrainerMemberRecurringReportsSection
        :trainee-id="traineeId"
        :format-date-time="formatDateTime"
      />
    </section>

    <section v-else class="min-h-0 min-w-0 border-t border-[var(--lgym-border)] pt-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
          {{ t("trainerMemberDetails.reports.submissionsEyebrow") }}
        </p>
        <h2 class="mt-1 text-lg font-semibold text-[var(--lgym-text)] sm:text-xl">
          {{ t("trainerMemberDetails.reports.submissionsTitle") }}
        </h2>
      </div>

      <div class="grid gap-4 pt-3">
        <section>
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
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
          <div class="mb-4 flex flex-wrap gap-2">
            <v-btn
              v-for="filterOption in feedbackFilterOptions"
              :key="filterOption.value"
              :color="feedbackFilter === filterOption.value ? 'primary' : undefined"
              :variant="feedbackFilter === filterOption.value ? 'flat' : 'outlined'"
              class="min-h-10 rounded-md px-4 font-semibold normal-case"
              @click="feedbackFilter = filterOption.value"
            >
              {{ filterOption.label }}
            </v-btn>
          </div>

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
              :items="filteredSubmissions"
              :loading="isLoadingSubmissions"
            item-value="_id"
            hide-default-footer
            hover
            row-clickable
            @row-click="openSubmissionPreview"
          >
            <template #mobile>
              <div class="border-y border-[var(--lgym-border)]">
                <template v-if="filteredSubmissions.length > 0">
                  <article
                    v-for="submission in filteredSubmissions"
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

                        <v-chip
                          :color="getFeedbackStatusColor(submission)"
                          size="small"
                          :variant="hasTrainerFeedback(submission) ? 'flat' : 'outlined'"
                          class="font-semibold"
                        >
                          {{ getFeedbackStatusLabel(submission) }}
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
                            {{ formatFieldAnswer(field, submission.answers?.[field.key || ""]) }}
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
                  {{ noSubmissionsMessage }}
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
                <v-chip
                  :color="getFeedbackStatusColor(toSubmission(item))"
                  size="small"
                  :variant="hasTrainerFeedback(toSubmission(item)) ? 'flat' : 'outlined'"
                  class="font-semibold"
                >
                  {{ getFeedbackStatusLabel(toSubmission(item)) }}
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
                {{ noSubmissionsMessage }}
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

        <v-dialog v-model="isPreviewDialogOpen" max-width="860" @update:model-value="(value) => { if (!value) void closeSubmissionPreview(); }">
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
                      {{ t("trainerMemberDetails.reports.meta.feedbackStatus") }}
                    </p>
                    <v-chip
                      :color="getFeedbackStatusColor(selectedSubmission)"
                      size="small"
                      :variant="hasTrainerFeedback(selectedSubmission) ? 'flat' : 'outlined'"
                      class="mt-2 font-semibold"
                    >
                      {{ getFeedbackStatusLabel(selectedSubmission) }}
                    </v-chip>
                  </div>

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
                        <template v-if="entry.kind === 'photos'">
                          <div v-if="entry.photos.length > 0" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <article
                              v-for="photo in entry.photos"
                              :key="photo._id || photo.storageKey || photo.viewType || entry.key"
                              class="overflow-hidden rounded-xl bg-[var(--lgym-note-bg)]"
                            >
                              <a
                                :href="photo.readUrl || photo.thumbnailUrl || '#'
                                "
                                target="_blank"
                                rel="noreferrer"
                                class="block"
                              >
                                <img
                                  v-if="photo.readUrl || photo.thumbnailUrl"
                                  :src="photo.thumbnailUrl || photo.readUrl || undefined"
                                  :alt="photo.viewType || entry.label"
                                  class="h-48 w-full object-cover"
                                />
                                <div v-else class="flex h-48 items-center justify-center bg-[var(--lgym-surface)] text-sm text-[var(--lgym-text-soft)]">
                                  {{ t("trainerMemberDetails.reports.fallback.noAnswer") }}
                                </div>
                              </a>
                              <div class="space-y-1 px-4 py-3">
                                <p class="text-sm font-semibold text-[var(--lgym-text)]">
                                  {{ formatPhotoViewLabel(photo.viewType) }}
                                </p>
                                <p class="text-xs text-[var(--lgym-text-soft)]">
                                  {{ formatDateTime(photo.uploadedAt) }}
                                </p>
                              </div>
                            </article>
                          </div>
                          <p v-else class="text-sm leading-7 text-[var(--lgym-text-muted)]">
                            {{ entry.answer }}
                          </p>
                        </template>

                        <template v-else-if="entry.kind === 'measurements'">
                          <div v-if="entry.measurementRows.length > 0" class="grid gap-3">
                            <div
                              v-for="row in entry.measurementRows"
                              :key="`${entry.key}-${row.label}`"
                              class="flex items-center justify-between gap-4 rounded-xl bg-[var(--lgym-note-bg)] px-4 py-3"
                            >
                              <p class="text-sm text-[var(--lgym-text-muted)]">
                                {{ row.label }}
                              </p>
                              <p class="text-sm font-semibold text-[var(--lgym-text)]">
                                {{ row.value }}
                              </p>
                            </div>
                          </div>
                          <p v-else class="text-sm leading-7 text-[var(--lgym-text-muted)]">
                            {{ entry.answer }}
                          </p>
                        </template>

                        <p v-else class="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--lgym-text-muted)]">
                          {{ entry.answer }}
                        </p>

                        <div class="mt-4">
                          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                            {{ t("trainerMemberDetails.reports.preview.fieldFeedbackLabel") }}
                          </p>
                          <v-textarea
                            :model-value="trainerFieldCommentsDraft[entry.key] || ''"
                            rows="2"
                            auto-grow
                            density="comfortable"
                            variant="outlined"
                            hide-details
                            class="mt-2 report-request-control"
                            :placeholder="t('trainerMemberDetails.reports.preview.fieldFeedbackPlaceholder')"
                            :disabled="isSavingFeedback"
                            @update:model-value="updateFieldComment(entry.key, $event)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    {{ t("trainerMemberDetails.reports.preview.overallFeedbackTitle") }}
                  </h4>
                  <v-textarea
                    v-model="trainerOverallCommentDraft"
                    rows="4"
                    auto-grow
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    class="mt-4 report-request-control"
                    :placeholder="t('trainerMemberDetails.reports.preview.overallFeedbackPlaceholder')"
                    :disabled="isSavingFeedback"
                  />
                </div>
              </div>
            </v-card-text>

            <v-card-actions class="justify-end gap-3 px-6 pb-6">
              <v-btn
                color="primary"
                class="min-h-10 rounded-md px-4"
                :loading="isSavingFeedback"
                @click="saveTrainerFeedback"
              >
                {{ t("trainerMemberDetails.reports.actions.saveFeedback") }}
              </v-btn>
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
import {
  useRoute,
  useRouter,
  type LocationQueryRaw,
} from "vue-router";

import TrainerMemberRecurringReportsSection from "./TrainerMemberRecurringReportsSection.vue";
import {
  getApiTrainerReportTemplates,
  getApiTrainerReportingPhotosHistory,
  postApiTrainerTraineesTraineeIdReportSubmissionsSubmissionIdFeedback,
  getApiTrainerTraineesTraineeIdReportSubmissions,
  postApiTrainerTraineesTraineeIdReportRequests,
} from "../../../api/generated/demo";
import {
  type CreateReportRequestRequest,
  type PhotoHistoryItemResponse,
  type ReportSubmissionDto,
  type ReportTemplateDto,
  type UpdateReportSubmissionFeedbackRequest,
} from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";
import AppDataTable from "../../ui/AppDataTable.vue";

const props = defineProps<{
  traineeId: string;
  initialSubmissionId?: string | null;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const templates = ref<ReportTemplateDto[]>([]);
const submissions = ref<ReportSubmissionDto[]>([]);
const isLoadingTemplates = ref(false);
const isLoadingSubmissions = ref(false);
const hasTemplatesError = ref(false);
const hasSubmissionsError = ref(false);
const isCreatingRequest = ref(false);
const isSavingFeedback = ref(false);
const isRequestDialogOpen = ref(false);
const isPreviewDialogOpen = ref(false);
const selectedSubmission = ref<ReportSubmissionDto | null>(null);
const feedbackFilter = ref<"all" | "answered" | "unanswered">("all");
const activeReportView = ref<"recurring" | "history">("history");
const trainerOverallCommentDraft = ref("");
const trainerFieldCommentsDraft = ref<Record<string, string>>({});
const submissionPhotos = ref<PhotoHistoryItemResponse[]>([]);
const isLoadingSubmissionPhotos = ref(false);
let submissionPhotosToken = 0;

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

const feedbackFilterOptions = computed(() => [
  {
    value: "all" as const,
    label: t("trainerMemberDetails.reports.filters.all"),
  },
  {
    value: "answered" as const,
    label: t("trainerMemberDetails.reports.filters.answered"),
  },
  {
    value: "unanswered" as const,
    label: t("trainerMemberDetails.reports.filters.unanswered"),
  },
]);

const reportViewTabs = computed(() => [
  {
    value: "recurring" as const,
    label: t("trainerMemberDetails.reports.recurring.title"),
    icon: "mdi-autorenew",
  },
  {
    value: "history" as const,
    label: t("trainerMemberDetails.reports.submissionsTitle"),
    icon: "mdi-history",
  },
]);

const hasNonEmptyComment = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const hasTrainerFeedback = (submission: ReportSubmissionDto | null | undefined) => {
  if (!submission) {
    return false;
  }

  if (hasNonEmptyComment(submission.trainerOverallComment)) {
    return true;
  }

  return Object.values(submission.trainerFieldComments ?? {}).some((comment) =>
    hasNonEmptyComment(comment),
  );
};

const getSubmissionSortTimestamp = (submission: ReportSubmissionDto) => {
  const rawDate =
    submission.submittedAt ??
    submission.request?.submittedAt ??
    submission.request?.createdAt ??
    null;

  if (!rawDate) {
    return 0;
  }

  const parsed = new Date(rawDate).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortedSubmissions = computed(() =>
  [...submissions.value].sort(
    (left, right) => getSubmissionSortTimestamp(right) - getSubmissionSortTimestamp(left),
  ),
);

const filteredSubmissions = computed(() => {
  if (feedbackFilter.value === "answered") {
    return sortedSubmissions.value.filter((submission) => hasTrainerFeedback(submission));
  }

  if (feedbackFilter.value === "unanswered") {
    return sortedSubmissions.value.filter((submission) => !hasTrainerFeedback(submission));
  }

  return sortedSubmissions.value;
});

const noSubmissionsMessage = computed(() => {
  if (submissions.value.length === 0) {
    return t("trainerMemberDetails.reports.empty.submissions");
  }

  if (feedbackFilter.value === "answered") {
    return t("trainerMemberDetails.reports.empty.answered");
  }

  if (feedbackFilter.value === "unanswered") {
    return t("trainerMemberDetails.reports.empty.unanswered");
  }

  return t("trainerMemberDetails.reports.empty.submissions");
});

const headers = computed(() => [
  { title: t("trainerMemberDetails.reports.form.template"), key: "template", sortable: false },
  { title: t("trainerMemberDetails.reports.meta.feedbackStatus"), key: "status", sortable: false },
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
  moduleConfig?: unknown | null;
};

type SubmissionAnswerEntry = {
  key: string;
  label: string;
  answer: string;
  kind: "text" | "photos" | "measurements";
  photos: PhotoHistoryItemResponse[];
  measurementRows: Array<{ label: string; value: string }>;
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
      kind: getFieldDisplayKind(field.type),
      photos: getFieldDisplayKind(field.type) === "photos" ? getPhotosForField(field) : [],
      measurementRows:
        getFieldDisplayKind(field.type) === "measurements"
          ? getMeasurementRowsForField(field, submission.answers?.[field.key || ""])
          : [],
    }));
  }

  return Object.entries(submission.answers ?? {}).map(([key, value]) => ({
    key,
    label: key,
    answer: formatAnswer(value),
    kind: "text" as const,
    photos: [],
    measurementRows: [],
  }));
});

const submissionAnswerSummary = (submission: ReportSubmissionDto) => {
  const fields = orderedFields(submission.request?.template?.fields);
  const firstField = fields[0];
  if (firstField?.key) {
    return formatFieldAnswer(firstField, submission.answers?.[firstField.key]);
  }

  const answers = Object.values(submission.answers ?? {});
  if (answers.length === 0) return t("trainerMemberDetails.reports.fallback.noAnswer");
  return formatAnswer(answers[0]);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getFieldDisplayKind = (type: string | null | undefined): SubmissionAnswerEntry["kind"] => {
  if (type === "Photos") return "photos";
  if (type === "Measurements") return "measurements";
  return "text";
};

const getHumanizedKey = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

const formatMeasurementKeyLabel = (value: string) => {
  const bodyPartTranslationKey = `trainerMemberDetails.measurements.bodyParts.${value}`;
  const translatedBodyPart = t(bodyPartTranslationKey);
  if (translatedBodyPart !== bodyPartTranslationKey) {
    return translatedBodyPart;
  }

  return getHumanizedKey(value);
};

const formatPhotoViewLabel = (value: string | null | undefined) => {
  if (!value) {
    return t("trainerMemberDetails.reports.fallback.noAnswer");
  }

  const translationKey = `trainerMemberDetails.trainerReportTemplates.modules.photos.views.${value.toLowerCase()}`;
  const translated = t(translationKey);
  return translated !== translationKey ? translated : value;
};

const getRequiredPhotoViews = (field: OrderedFieldLike) => {
  if (!isRecord(field.moduleConfig) || !Array.isArray(field.moduleConfig.requiredViews)) {
    return [] as string[];
  }

  return field.moduleConfig.requiredViews.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
};

const getPhotosForField = (field: OrderedFieldLike) => {
  const requiredViews = getRequiredPhotoViews(field);
  if (requiredViews.length === 0) {
    return submissionPhotos.value;
  }

  const normalizedViews = new Set(requiredViews.map((item) => item.toLowerCase()));
  return submissionPhotos.value.filter((photo) =>
    normalizedViews.has((photo.viewType ?? "").toLowerCase()),
  );
};

const getConfiguredMeasurementTypes = (field: OrderedFieldLike) => {
  if (!isRecord(field.moduleConfig) || !Array.isArray(field.moduleConfig.measurementTypes)) {
    return [] as string[];
  }

  return field.moduleConfig.measurementTypes.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
};

const getMeasurementRows = (value: unknown): Array<{ label: string; value: string }> => {
  return getMeasurementRowsForField(undefined, value);
};

const getMeasurementRowsForField = (
  field: OrderedFieldLike | undefined,
  value: unknown,
): Array<{ label: string; value: string }> => {
  if (!isRecord(value)) {
    return [];
  }

  const configuredTypes = field ? getConfiguredMeasurementTypes(field) : [];
  const sourceEntries = Object.entries(value);
  const orderedEntries = configuredTypes.length > 0
    ? configuredTypes
        .map((type) => sourceEntries.find(([key]) => key.toLowerCase() === type.toLowerCase()) ?? null)
        .filter((entry): entry is [string, unknown] => entry !== null)
    : sourceEntries;

  return orderedEntries.map(([key, rawValue]) => {
    if (isRecord(rawValue)) {
      const numericValue = rawValue.value;
      const unit = typeof rawValue.unit === "string" ? rawValue.unit : null;
      const formattedValue = formatAnswer(numericValue);
      return {
        label: formatMeasurementKeyLabel(key),
        value: unit ? `${formattedValue} ${unit}` : formattedValue,
      };
    }

    return {
      label: formatMeasurementKeyLabel(key),
      value: formatAnswer(rawValue),
    };
  });
};

const getFeedbackStatusLabel = (submission: ReportSubmissionDto | null | undefined) =>
  hasTrainerFeedback(submission)
    ? t("trainerMemberDetails.reports.feedbackStatus.answered")
    : t("trainerMemberDetails.reports.feedbackStatus.unanswered");

const getFeedbackStatusColor = (submission: ReportSubmissionDto | null | undefined) =>
  hasTrainerFeedback(submission) ? "success" : "warning";

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
  trainerOverallCommentDraft.value = selectedSubmission.value.trainerOverallComment || "";
  trainerFieldCommentsDraft.value = {
    ...(selectedSubmission.value.trainerFieldComments ?? {}),
  };
  submissionPhotos.value = [];
  isPreviewDialogOpen.value = true;
  void loadSubmissionPhotos(selectedSubmission.value);
};

const clearSubmissionQuery = async () => {
  if (!route.query.submissionId) {
    return;
  }

  const nextQuery: LocationQueryRaw = { ...route.query };
  delete nextQuery.submissionId;
  await router.replace({ query: nextQuery });
};

const closeSubmissionPreview = async () => {
  isPreviewDialogOpen.value = false;
  selectedSubmission.value = null;
  trainerOverallCommentDraft.value = "";
  trainerFieldCommentsDraft.value = {};
  submissionPhotos.value = [];
  await clearSubmissionQuery();
};

const loadSubmissionPhotos = async (submission: ReportSubmissionDto | null) => {
  const requestId = submission?.reportRequestId?.trim();
  if (!requestId) {
    submissionPhotos.value = [];
    return;
  }

  const currentToken = ++submissionPhotosToken;
  isLoadingSubmissionPhotos.value = true;
  try {
    const response = await getApiTrainerReportingPhotosHistory({ requestId, traineeId: props.traineeId });

    if (currentToken !== submissionPhotosToken || selectedSubmission.value?.reportRequestId?.trim() !== requestId) {
      return;
    }

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
      submissionPhotos.value = [];
      return;
    }

    submissionPhotos.value = response.data?.photos ?? [];
  } catch (error) {
    if (currentToken !== submissionPhotosToken) {
      return;
    }
    console.error(error);
    submissionPhotos.value = [];
  } finally {
    if (currentToken === submissionPhotosToken) {
      isLoadingSubmissionPhotos.value = false;
    }
  }
};

const updateFieldComment = (fieldKey: string, value: string | null) => {
  trainerFieldCommentsDraft.value = {
    ...trainerFieldCommentsDraft.value,
    [fieldKey]: value ?? "",
  };
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

watch(
  () => props.initialSubmissionId,
  (initialSubmissionId) => {
    if (initialSubmissionId) {
      activeReportView.value = "history";
    }
  },
  { immediate: true },
);

watch(
  [() => props.initialSubmissionId, submissions, isLoadingSubmissions],
  ([initialSubmissionId, currentSubmissions, loading]) => {
    if (!initialSubmissionId || loading || activeReportView.value !== "history") {
      return;
    }

    if (selectedSubmission.value?._id === initialSubmissionId) {
      return;
    }

    const matchedSubmission = currentSubmissions.find(
      (submission) => submission._id === initialSubmissionId,
    );

    if (matchedSubmission) {
      openSubmissionPreview(matchedSubmission);
    }
  },
  { immediate: true },
);

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

const saveTrainerFeedback = async () => {
  if (!selectedSubmission.value?._id) {
    return;
  }

  isSavingFeedback.value = true;

  try {
    const payload: UpdateReportSubmissionFeedbackRequest = {
      trainerOverallComment: trainerOverallCommentDraft.value.trim() || null,
      trainerFieldComments: trainerFieldCommentsDraft.value,
    };

    const response = await postApiTrainerTraineesTraineeIdReportSubmissionsSubmissionIdFeedback(
      props.traineeId,
      selectedSubmission.value._id,
      payload,
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
      else toast.error("trainerMemberDetails.reports.feedback.saveFailed");
      return;
    }

    const updatedSubmission = response.data as ReportSubmissionDto;
    submissions.value = submissions.value.map((submission) =>
      submission._id === updatedSubmission._id ? updatedSubmission : submission,
    );
    selectedSubmission.value = updatedSubmission;
    trainerOverallCommentDraft.value = updatedSubmission.trainerOverallComment || "";
    trainerFieldCommentsDraft.value = {
      ...(updatedSubmission.trainerFieldComments ?? {}),
    };
    await loadSubmissions();
    selectedSubmission.value =
      submissions.value.find((submission) => submission._id === updatedSubmission._id) ??
      updatedSubmission;
    toast.success("trainerMemberDetails.reports.feedback.saveSuccess");
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.reports.feedback.saveFailed");
  } finally {
    isSavingFeedback.value = false;
  }
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

  if (field.type === "Photos") {
    const count = getPhotosForField(field).length;
    return count > 0
      ? t("trainerMemberDetails.reports.preview.photosCount", { count })
      : isLoadingSubmissionPhotos.value
        ? t("trainerMemberDetails.reports.preview.photosLoading")
        : t("trainerMemberDetails.reports.preview.photosEmpty");
  }

  if (field.type === "Measurements") {
    const rows = getMeasurementRows(value);
    return rows.length > 0
      ? t("trainerMemberDetails.reports.preview.measurementsCount", { count: rows.length })
      : t("trainerMemberDetails.reports.preview.measurementsEmpty");
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
