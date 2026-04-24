<template>
  <section class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]">
    <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.eyebrow") }}
          </p>
          <h2 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.title") }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.subtitle") }}
          </p>
        </div>

        <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openTemplateDialog()">
          {{ t("trainerMemberDetails.trainerReportTemplates.actions.createTemplate") }}
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="isLoadingTemplates" indeterminate color="primary" />

    <div class="flex flex-col gap-0 px-4 py-0 sm:px-5 lg:px-6">
      <div
        v-if="hasTemplatesError && !isLoadingTemplates"
        class="my-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center"
      >
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.trainerReportTemplates.error.templates") }}
        </p>
        <v-btn class="mt-4" color="primary" variant="outlined" @click="loadTemplates">
          {{ t("trainerMemberDetails.trainerReportTemplates.actions.retry") }}
        </v-btn>
      </div>

      <template v-else>
        <article
          v-for="template in templates"
          :key="template._id || template.name || 'template'"
          class="border-b border-[var(--lgym-border)] py-4 last:border-b-0"
        >
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                  {{ template.name || t("trainerMemberDetails.trainerReportTemplates.fallback.noTemplateName") }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                  {{ template.description || t("trainerMemberDetails.trainerReportTemplates.fallback.noDescription") }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <v-btn variant="outlined" color="primary" class="min-h-10 rounded-md px-4" @click="openTemplateDialog(template)">
                  {{ t("trainerMemberDetails.trainerReportTemplates.actions.editTemplate") }}
                </v-btn>
                <v-btn variant="outlined" color="error" class="min-h-10 rounded-md px-4" @click="deleteTemplate(template)">
                  {{ t("trainerMemberDetails.trainerReportTemplates.actions.deleteTemplate") }}
                </v-btn>
              </div>
            </div>

            <div class="border-t border-[var(--lgym-border)] pt-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.trainerReportTemplates.preview.fields") }}
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <v-chip
                  v-for="field in orderedFields(template.fields)"
                  :key="field.key || field.label || 'field'"
                  size="small"
                  variant="outlined"
                >
                  {{ field.label || field.key }} · {{ field.type || t("trainerMemberDetails.trainerReportTemplates.fallback.noFieldType") }}
                </v-chip>
              </div>
            </div>
          </div>
        </article>

        <div
          v-if="templates.length === 0"
           class="my-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)]"
        >
          {{ t("trainerMemberDetails.trainerReportTemplates.empty.templates") }}
        </div>
      </template>
    </div>
  </section>

  <v-dialog v-model="isTemplateDialogOpen" max-width="1180">
    <v-card rounded="lg">
      <v-card-title class="border-b border-[var(--lgym-border)] px-5 py-5 text-lg font-semibold sm:px-6 sm:py-6">
        <div class="flex flex-col gap-2">
          <span>
            {{
              editingTemplateId
                ? t("trainerMemberDetails.trainerReportTemplates.dialog.editTemplateTitle")
                : t("trainerMemberDetails.trainerReportTemplates.dialog.createTemplateTitle")
            }}
          </span>
          <span class="text-sm font-normal text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.subtitle") }}
          </span>
        </div>
      </v-card-title>
      <v-card-text class="px-5 py-5 sm:px-6 sm:py-6">
        <div class="grid gap-4 border-b border-[var(--lgym-border)] pb-5 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.4fr)] lg:gap-5">
          <v-text-field
            v-model="templateForm.name"
            :label="t('trainerMemberDetails.trainerReportTemplates.form.templateName')"
            density="compact"
            variant="outlined"
            hide-details
            class="template-field-control"
          />
          <v-textarea
            v-model="templateForm.description"
            rows="2"
            auto-grow
            :label="t('trainerMemberDetails.trainerReportTemplates.form.templateDescription')"
            density="compact"
            variant="outlined"
            hide-details
            class="template-field-control"
          />
        </div>

        <div class="pt-6">
          <div class="mb-4 flex items-center justify-between gap-4 border-b border-[var(--lgym-border)] pb-3">
            <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
              {{ t("trainerMemberDetails.trainerReportTemplates.form.fieldsTitle") }}
            </h4>
            <v-btn size="small" variant="outlined" class="rounded-md px-3.5" prepend-icon="mdi-plus" @click="appendField">
              {{ t("trainerMemberDetails.trainerReportTemplates.actions.addField") }}
            </v-btn>
          </div>

          <div class="hidden border-b border-[var(--lgym-border)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_140px_96px_124px_52px] lg:gap-x-4 lg:px-1 lg:py-3">
            <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldLabel') }}</span>
            <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldKey') }}</span>
            <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldType') }}</span>
            <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder') }}</span>
            <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldRequired') }}</span>
            <span class="text-right">#</span>
          </div>

          <div class="divide-y divide-[var(--lgym-border)]">
            <div
              v-for="(field, index) in templateForm.fields"
              :key="`${field.key}-${index}`"
              class="template-field-row py-4 transition-colors hover:bg-[var(--lgym-note-bg)]/28"
            >
              <div class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_140px_96px_124px_52px] lg:items-center lg:gap-x-4 lg:gap-y-3">
                <v-text-field
                  v-model="field.label"
                  :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldLabel')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="template-field-control"
                />
                <v-text-field
                  v-model="field.key"
                  :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldKey')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="template-field-control"
                />
                <v-select
                  v-model="field.type"
                  :items="fieldTypeOptions"
                  item-title="label"
                  item-value="value"
                  :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldType')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="template-field-control"
                />
                <v-text-field
                  v-model.number="field.order"
                  type="number"
                  :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="template-field-control"
                />
                <div class="flex min-h-11 items-center lg:pl-2 lg:justify-center">
                  <v-checkbox
                    v-model="field.isRequired"
                    :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldRequired')"
                    density="compact"
                    hide-details
                    class="template-inline-checkbox"
                  />
                </div>
                <div class="flex min-h-11 items-center justify-end lg:pr-1">
                  <v-btn
                    icon="mdi-delete-outline"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removeField(index)"
                  />
                </div>
              </div>
            </div>

            <div v-if="templateForm.fields.length === 0" class="py-8 text-sm text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.trainerReportTemplates.empty.templates") }}
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="sticky bottom-0 mt-2 justify-end gap-2 border-t border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]/95 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-4.5">
        <v-btn variant="text" class="rounded-md px-3.5" @click="isTemplateDialogOpen = false">
          {{ t("trainerMemberDetails.trainerReportTemplates.actions.cancel") }}
        </v-btn>
        <v-btn color="primary" class="rounded-md px-4.5" :loading="isSavingTemplate" @click="saveTemplate">
          {{ t("trainerMemberDetails.trainerReportTemplates.actions.save") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import {
  getApiTrainerReportTemplates,
  getApiTrainerReportTemplatesTemplateId,
  postApiTrainerReportTemplates,
  postApiTrainerReportTemplatesTemplateIdDelete,
  postApiTrainerReportTemplatesTemplateIdUpdate,
} from "../../../api/generated/demo";
import {
  ReportTemplateFieldRequestType,
  type ReportTemplateDto,
  type ReportTemplateFieldRequest,
} from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";

type EditableTemplateField = {
  key: string;
  label: string;
  type: ReportTemplateFieldRequest["type"];
  isRequired: boolean;
  order: number;
};

type TemplateFormState = {
  name: string;
  description: string;
  fields: EditableTemplateField[];
};

type OrderedFieldLike = {
  key?: string | null;
  label?: string | null;
  type?: string | null;
  isRequired?: boolean;
  order?: number;
};

const props = defineProps<{
  redirectPath?: string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const templates = ref<ReportTemplateDto[]>([]);
const isLoadingTemplates = ref(false);
const hasTemplatesError = ref(false);
const isTemplateDialogOpen = ref(false);
const editingTemplateId = ref<string | null>(null);
const isSavingTemplate = ref(false);

const templateForm = ref<TemplateFormState>({
  name: "",
  description: "",
  fields: [],
});

const fieldTypeOptions = computed(() => [
  { label: ReportTemplateFieldRequestType.Text, value: ReportTemplateFieldRequestType.Text },
  { label: ReportTemplateFieldRequestType.Number, value: ReportTemplateFieldRequestType.Number },
  { label: ReportTemplateFieldRequestType.Boolean, value: ReportTemplateFieldRequestType.Boolean },
  { label: ReportTemplateFieldRequestType.Date, value: ReportTemplateFieldRequestType.Date },
]);

let templateToken = 0;

const redirectPath = computed(() => props.redirectPath || "/trainer/report-templates");

const isEmptyTemplatesResponse = (status: number, data: unknown) => {
  if (status === 204 || status === 404) return true;

  const message = getApiErrorMessage(data)?.toLocaleLowerCase("pl-PL") ?? "";
  return (
    message.includes("nie znaleziono") ||
    message.includes("no records") ||
    message.includes("not found")
  );
};

const orderedFields = (fields: OrderedFieldLike[] | null | undefined) =>
  [...(fields ?? [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

const resetTemplateForm = () => {
  templateForm.value = {
    name: "",
    description: "",
    fields: [],
  };
};

const appendField = () => {
  templateForm.value.fields.push({
    key: "",
    label: "",
    type: ReportTemplateFieldRequestType.Text,
    isRequired: false,
    order: templateForm.value.fields.length + 1,
  });
};

const removeField = (index: number) => {
  templateForm.value.fields.splice(index, 1);
};

const openTemplateDialog = async (template?: ReportTemplateDto) => {
  editingTemplateId.value = template?._id ?? null;
  resetTemplateForm();

  if (template?._id) {
    const response = await getApiTrainerReportTemplatesTemplateId(template._id);

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        redirectPath.value,
      )
    ) {
      return;
    }

    if (response.status === 200) {
      const data = response.data;
      templateForm.value = {
        name: data.name ?? "",
        description: data.description ?? "",
        fields: orderedFields(data.fields).map((field) => ({
          key: field.key ?? "",
          label: field.label ?? "",
          type:
            (field.type as ReportTemplateFieldRequest["type"]) ??
            ReportTemplateFieldRequestType.Text,
          isRequired: Boolean(field.isRequired),
          order: field.order ?? 0,
        })),
      };
    }
  }

  if (templateForm.value.fields.length === 0) {
    appendField();
  }

  isTemplateDialogOpen.value = true;
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
        redirectPath.value,
      )
    ) {
      return;
    }

    if (isEmptyTemplatesResponse(response.status, response.data)) {
      templates.value = [];
      return;
    }

    if (response.status !== 200) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.trainerReportTemplates.feedback.loadTemplatesFailed");
      hasTemplatesError.value = true;
      return;
    }

    templates.value = response.data ?? [];
  } catch (error) {
    if (currentToken !== templateToken) return;
    console.error(error);
    toast.error("trainerMemberDetails.trainerReportTemplates.feedback.loadTemplatesFailed");
    hasTemplatesError.value = true;
  } finally {
    if (currentToken === templateToken) {
      isLoadingTemplates.value = false;
    }
  }
};

const saveTemplate = async () => {
  const trimmedName = templateForm.value.name.trim();
  if (!trimmedName) {
    toast.error("trainerMemberDetails.trainerReportTemplates.feedback.templateNameRequired");
    return;
  }

  const fields = templateForm.value.fields
    .map((field, index) => ({
      key: field.key.trim(),
      label: field.label.trim(),
      type: field.type,
      isRequired: field.isRequired,
      order: field.order || index + 1,
    }))
    .filter((field) => field.key && field.label && field.type);

  if (fields.length === 0) {
    toast.error("trainerMemberDetails.trainerReportTemplates.feedback.templateFieldRequired");
    return;
  }

  isSavingTemplate.value = true;

  try {
    const payload = {
      name: trimmedName,
      description: templateForm.value.description.trim() || null,
      fields,
    };

    const response = editingTemplateId.value
      ? await postApiTrainerReportTemplatesTemplateIdUpdate(
          editingTemplateId.value,
          payload,
        )
      : await postApiTrainerReportTemplates(payload);

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        redirectPath.value,
      )
    ) {
      return;
    }

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else {
        toast.error(
          editingTemplateId.value
            ? "trainerMemberDetails.trainerReportTemplates.feedback.updateTemplateFailed"
            : "trainerMemberDetails.trainerReportTemplates.feedback.createTemplateFailed",
        );
      }
      return;
    }

    toast.success(
      editingTemplateId.value
        ? "trainerMemberDetails.trainerReportTemplates.feedback.updateTemplateSuccess"
        : "trainerMemberDetails.trainerReportTemplates.feedback.createTemplateSuccess",
    );
    isTemplateDialogOpen.value = false;
    await loadTemplates();
  } catch (error) {
    console.error(error);
    toast.error(
      editingTemplateId.value
        ? "trainerMemberDetails.trainerReportTemplates.feedback.updateTemplateFailed"
        : "trainerMemberDetails.trainerReportTemplates.feedback.createTemplateFailed",
    );
  } finally {
    isSavingTemplate.value = false;
  }
};

const deleteTemplate = async (template: ReportTemplateDto) => {
  const templateId = template._id?.trim();
  if (!templateId) return;

  const confirmed = window.confirm(
    t("trainerMemberDetails.trainerReportTemplates.actions.deleteTemplateConfirm", {
      name: template.name || t("trainerMemberDetails.trainerReportTemplates.fallback.noTemplateName"),
    }),
  );
  if (!confirmed) return;

  try {
    const response = await postApiTrainerReportTemplatesTemplateIdDelete(templateId);

    if (
      await handleTrainerUnauthorizedResponse(
        response.status,
        router,
        toast,
        redirectPath.value,
      )
    ) {
      return;
    }

    if (response.status < 200 || response.status >= 300) {
      const message = getApiErrorMessage(response.data);
      if (message) toast.errorMessage(message);
      else toast.error("trainerMemberDetails.trainerReportTemplates.feedback.deleteTemplateFailed");
      return;
    }

    toast.success("trainerMemberDetails.trainerReportTemplates.feedback.deleteTemplateSuccess");
    await loadTemplates();
  } catch (error) {
    console.error(error);
    toast.error("trainerMemberDetails.trainerReportTemplates.feedback.deleteTemplateFailed");
  }
};

watch(
  redirectPath,
  () => {
    void loadTemplates();
  },
  { immediate: true },
);
</script>

<style scoped>
.template-field-control :deep(.v-field) {
  border-radius: 0.375rem;
  min-height: 44px;
}

.template-field-control :deep(.v-field__input) {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

.template-inline-checkbox {
  margin: 0;
}

.template-inline-checkbox :deep(.v-selection-control) {
  min-height: 44px;
}

.template-inline-checkbox :deep(.v-label) {
  font-size: 0.875rem;
}

@media (min-width: 1024px) {
  .template-field-row :deep(.v-label) {
    display: none;
  }
}
</style>
