<template>
  <section class="overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)] flex-1">
  <div class="border-b border-[var(--lgym-border)] px-6 py-6 lg:px-8 lg:py-7">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="lgym-section-heading">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.eyebrow") }}
          </p>
          <h2 class="text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.title") }}
          </h2>
          <p class="lgym-section-heading__subtitle text-sm leading-6 text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.trainerReportTemplates.page.subtitle") }}
          </p>
        </div>

        <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openTemplateDialog()">
          {{ t("trainerMemberDetails.trainerReportTemplates.actions.createTemplate") }}
        </v-btn>
      </div>
    </div>

    <div>
      <div
        v-if="hasTemplatesError && !isLoadingTemplates"
        class="mx-4 my-4 rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center sm:mx-5 lg:mx-6"
      >
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.trainerReportTemplates.error.templates") }}
        </p>
        <v-btn class="mt-4" color="primary" variant="outlined" @click="loadTemplates">
          {{ t("trainerMemberDetails.trainerReportTemplates.actions.retry") }}
        </v-btn>
      </div>

      <AppDataTable
        v-else
        :headers="headers"
        :items="templates"
        :loading="isLoadingTemplates"
        item-value="_id"
        hide-default-footer
        hover
      >
        <template #mobile>
          <div class="border-y border-[var(--lgym-border)]">
            <template v-if="templates.length > 0">
              <article
                v-for="template in templates"
                :key="template._id || template.name || 'template'"
        class="border-b border-[var(--lgym-border)] px-4 py-4 last:border-b-0"
              >
                <div class="flex flex-col gap-4">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 class="text-lg font-semibold text-[var(--lgym-text)]">
                        {{
                          template.name ||
                          t("trainerMemberDetails.trainerReportTemplates.fallback.noTemplateName")
                        }}
                      </h3>
                      <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
                        {{
                          template.description ||
                          t("trainerMemberDetails.trainerReportTemplates.fallback.noDescription")
                        }}
                      </p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <v-btn
                        variant="outlined"
                        color="primary"
                        class="min-h-10 rounded-md px-4"
                        @click="openTemplateDialog(template)"
                      >
                        {{ t("trainerMemberDetails.trainerReportTemplates.actions.editTemplate") }}
                      </v-btn>
                      <v-btn
                        variant="outlined"
                        color="error"
                        class="min-h-10 rounded-md px-4"
                        @click="deleteTemplate(template)"
                      >
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
                          {{ getTemplateFieldPreviewLabel(field) }}
                        </v-chip>
                      </div>
                    </div>
                </div>
              </article>
            </template>

            <div
              v-else
              class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8"
            >
              {{ t("trainerMemberDetails.trainerReportTemplates.empty.templates") }}
            </div>
          </div>
        </template>

        <template #item.template="{ item }">
      <div class="px-4 py-4 lg:px-5">
            <h3 class="text-base font-semibold text-[var(--lgym-text)]">
              {{
                toTemplate(item).name ||
                t("trainerMemberDetails.trainerReportTemplates.fallback.noTemplateName")
              }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{
                toTemplate(item).description ||
                t("trainerMemberDetails.trainerReportTemplates.fallback.noDescription")
              }}
            </p>
          </div>
        </template>

        <template #item.fields="{ item }">
      <div class="px-4 py-4 lg:px-5">
            <div class="flex flex-wrap gap-2">
              <v-chip
                v-for="field in orderedFields(toTemplate(item).fields)"
                :key="field.key || field.label || 'field'"
                size="small"
                variant="outlined"
              >
                {{ getTemplateFieldPreviewLabel(field) }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #item.actions="{ item }">
      <div class="flex flex-wrap justify-end gap-2 px-4 py-4 lg:px-5">
            <v-btn
              variant="outlined"
              color="primary"
              class="min-h-10 rounded-md px-4"
              @click="openTemplateDialog(toTemplate(item))"
            >
              {{ t("trainerMemberDetails.trainerReportTemplates.actions.editTemplate") }}
            </v-btn>
            <v-btn
              variant="outlined"
              color="error"
              class="min-h-10 rounded-md px-4"
              @click="deleteTemplate(toTemplate(item))"
            >
              {{ t("trainerMemberDetails.trainerReportTemplates.actions.deleteTemplate") }}
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="px-6 py-10 text-center text-sm text-[var(--lgym-text-muted)] lg:px-8">
            {{ t("trainerMemberDetails.trainerReportTemplates.empty.templates") }}
          </div>
        </template>
      </AppDataTable>
    </div>
  </section>

  <v-dialog v-model="isTemplateDialogOpen" max-width="1120">
    <v-card rounded="md" class="report-template-dialog overflow-hidden">
      <div class="template-dialog-hero sticky top-0 z-10 px-4 py-4 sm:px-5 sm:py-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="max-w-3xl">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--v-theme-primary))]">
              {{ t("trainerMemberDetails.trainerReportTemplates.page.eyebrow") }}
            </p>
            <h3 class="mt-2 text-xl font-semibold text-[var(--lgym-text)] sm:text-2xl">
              {{
                editingTemplateId
                  ? t("trainerMemberDetails.trainerReportTemplates.dialog.editTemplateTitle")
                  : t("trainerMemberDetails.trainerReportTemplates.dialog.createTemplateTitle")
              }}
            </h3>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--lgym-text-muted)]">
              {{ t("trainerMemberDetails.trainerReportTemplates.page.subtitle") }}
            </p>
          </div>

          <div class="flex items-center gap-2 text-sm text-[var(--lgym-text-muted)] lg:max-w-[320px] lg:justify-end">
            <span>{{ templateFieldCount }} {{ t("trainerMemberDetails.trainerReportTemplates.preview.fields") }}</span>
          </div>
        </div>
      </div>

      <v-card-text class="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
        <div>
          <div class="space-y-5">
            <section class="template-dialog-panel">
              <div class="flex flex-col gap-2">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                  {{ t("trainerMemberDetails.trainerReportTemplates.form.templateName") }}
                </p>
              </div>

              <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(240px,0.95fr)_minmax(0,1.25fr)]">
                <v-text-field
                  v-model="templateForm.name"
                  :label="t('trainerMemberDetails.trainerReportTemplates.form.templateName')"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="template-field-control"
                />
                <v-textarea
                  v-model="templateForm.description"
                  rows="3"
                  auto-grow
                  :label="t('trainerMemberDetails.trainerReportTemplates.form.templateDescription')"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="template-field-control"
                />
              </div>
            </section>

            <section class="template-dialog-panel">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    {{ t("trainerMemberDetails.trainerReportTemplates.form.fieldsTitle") }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="outlined"
                    class="rounded-md px-3.5"
                    prepend-icon="mdi-plus"
                    @click="appendField"
                  >
                    {{ t("trainerMemberDetails.trainerReportTemplates.actions.addField") }}
                  </v-btn>
                </div>
              </div>

               <div class="template-fields-head mt-4 hidden xl:grid">
                 <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldLabel') }}</span>
                 <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldKey') }}</span>
                 <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldType') }}</span>
                 <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder') }}</span>
                 <span>{{ t('trainerMemberDetails.trainerReportTemplates.form.fieldRequired') }}</span>
                 <span class="text-right">#</span>
               </div>

               <VueDraggable
                 v-model="templateForm.fields"
                 handle=".template-drag-handle"
                 class="template-fields-scroll mt-5 grid gap-3"
                 ghost-class="template-field-ghost"
                 chosen-class="template-field-chosen"
                 drag-class="template-field-drag"
                 :animation="180"
                 @update="syncTemplateFieldOrders"
               >
                 <div
                   v-for="(field, index) in templateForm.fields"
                   :key="field.localId"
                   class="template-field-card"
                 >
                   <div class="flex flex-col gap-3">
                     <div class="flex items-center justify-between gap-3 xl:hidden">
                       <div class="flex min-w-0 items-center gap-3">
                         <button
                           type="button"
                           class="template-drag-handle template-field-index"
                           :title="t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder')"
                           :aria-label="t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder')"
                         >
                           <v-icon icon="mdi-drag" size="16" />
                         </button>
                         <span class="template-field-index template-field-index--order">
                           {{ String(index + 1).padStart(2, "0") }}
                         </span>

                         <div class="min-w-0">
                          <p class="truncate text-sm font-semibold text-[var(--lgym-text)]">
                            {{ `${t('trainerMemberDetails.trainerReportTemplates.form.fieldLabel')} ${index + 1}` }}
                          </p>
                          <div class="mt-1 flex flex-wrap gap-2">
                            <v-chip size="x-small" variant="outlined" color="primary">
                              {{ getFieldTypeLabel(field.type) }}
                            </v-chip>
                            <v-chip v-if="field.isRequired" size="x-small" variant="flat" color="primary">
                              {{ t("trainerMemberDetails.trainerReportTemplates.form.fieldRequired") }}
                            </v-chip>
                          </div>
                        </div>
                      </div>

                      <v-btn
                        icon="mdi-delete-outline"
                        size="small"
                        variant="text"
                        color="error"
                        @click="removeField(index)"
                      />
                    </div>

                    <div class="template-field-grid">
                      <v-text-field
                        v-model="field.label"
                        :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldLabel')"
                        density="comfortable"
                        variant="outlined"
                        hide-details
                        class="template-field-control template-field-row"
                      />
                       <v-text-field
                         v-model="field.key"
                         :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldKey')"
                        density="comfortable"
                        variant="outlined"
                        hide-details
                        class="template-field-control template-field-row"
                      />
                       <v-select
                          v-model="field.type"
                         :items="fieldTypeOptions"
                         item-title="label"
                         item-value="value"
                         :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldType')"
                         density="comfortable"
                         variant="outlined"
                         hide-details
                         class="template-field-control template-field-row"
                         @update:model-value="onFieldTypeChange(field, $event)"
                       />
                       <div class="template-drag-slot flex min-h-11 items-center xl:justify-center">
                         <button
                           type="button"
                           class="template-drag-handle template-drag-button"
                           :title="t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder')"
                           :aria-label="t('trainerMemberDetails.trainerReportTemplates.form.fieldOrder')"
                         >
                           <v-icon icon="mdi-drag" size="18" />
                           <span class="hidden text-xs font-medium xl:inline">
                             {{ String(index + 1).padStart(2, '0') }}
                           </span>
                         </button>
                       </div>
                       <div class="template-checkbox-wrap flex min-h-11 items-center xl:justify-center">
                         <v-checkbox
                           v-model="field.isRequired"
                          :label="t('trainerMemberDetails.trainerReportTemplates.form.fieldRequired')"
                          density="comfortable"
                          hide-details
                          class="template-inline-checkbox"
                        />
                      </div>
                      <div class="hidden min-h-11 items-center justify-end xl:flex">
                        <v-btn
                          icon="mdi-delete-outline"
                          size="small"
                          variant="text"
                          color="error"
                          @click="removeField(index)"
                        />
                     </div>
                     <div v-if="isModuleFieldType(field.type)" class="template-module-config-panel">
                       <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                         <div>
                           <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                             {{ t("trainerMemberDetails.trainerReportTemplates.form.moduleConfigTitle") }}
                           </p>
                           <p class="mt-1 text-sm leading-6 text-[var(--lgym-text-muted)]">
                             {{ getFieldModuleDescription(field.type) }}
                           </p>
                         </div>

                         <v-chip size="small" color="primary" variant="tonal">
                           {{ getFieldTypeLabel(field.type) }}
                         </v-chip>
                       </div>

                       <div class="mt-4">
                          <v-select
                             v-if="field.type === ReportTemplateFieldRequestType.Photos"
                             v-model="field.moduleConfig.requiredViews"
                             :items="photoViewOptions"
                            item-title="label"
                            item-value="value"
                            :label="t('trainerMemberDetails.trainerReportTemplates.form.photoViewsLabel')"
                            :placeholder="t('trainerMemberDetails.trainerReportTemplates.form.photoViewsPlaceholder')"
                            multiple
                            chips
                            closable-chips
                            density="comfortable"
                             variant="outlined"
                             hide-details
                             class="template-field-control"
                           />
                          <v-select
                            v-else-if="field.type === ReportTemplateFieldRequestType.Measurements"
                            v-model="field.moduleConfig.measurementTypes"
                           :items="measurementModuleOptions"
                           item-title="label"
                           item-value="value"
                           :label="t('trainerMemberDetails.trainerReportTemplates.form.measurementTypesLabel')"
                           multiple
                           chips
                           closable-chips
                           density="comfortable"
                           variant="outlined"
                           hide-details
                           class="template-field-control"
                         />
                       </div>
                     </div>
                    </div>
                  </div>
                 </div>

                 <div v-if="templateForm.fields.length === 0" class="template-empty-state">
                   <p class="text-sm leading-6 text-[var(--lgym-text-muted)]">
                     {{ t("trainerMemberDetails.trainerReportTemplates.empty.templates") }}
                   </p>
                 </div>
               </VueDraggable>
             </section>
           </div>
         </div>
      </v-card-text>

      <v-card-actions class="sticky bottom-0 z-10 mt-1 justify-end gap-3 border-t border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div class="flex flex-wrap justify-end gap-2">
          <v-btn variant="text" class="rounded-md px-3.5" @click="isTemplateDialogOpen = false">
            {{ t("trainerMemberDetails.trainerReportTemplates.actions.cancel") }}
          </v-btn>
          <v-btn color="primary" class="rounded-md px-4.5" :loading="isSavingTemplate" @click="saveTemplate">
            {{ t("trainerMemberDetails.trainerReportTemplates.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
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
  type ReportTemplateFieldDto,
  type ReportTemplateFieldRequest,
  type UpsertReportTemplateRequest,
} from "../../../api/model";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { useConfirmDialog } from "../../../composables/useConfirmDialog";
import { handleTrainerUnauthorizedResponse } from "../../../composables/useTrainerMembers";
import { useToast } from "../../../composables/useToast";
import AppDataTable from "../../ui/AppDataTable.vue";

type EditableTemplateField = {
  localId: string;
  key: string;
  label: string;
  type: ReportTemplateFieldRequest["type"];
  isRequired: boolean;
  order: number;
  moduleConfig: EditableTemplateFieldModuleConfig;
};

type ReportPhotoView = string;

type ReportMeasurementType =
  | "BodyWeight"
  | "BodyFat"
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Abs"
  | "Quads"
  | "Hamstrings"
  | "Calves"
  | "Glutes"
  | "Neck"
  | "Waist"
  | "Hips"
  | "Thigh"
  | "Bmi";

type EditableTemplateFieldModuleConfig = {
  requiredViews: ReportPhotoView[];
  measurementTypes: ReportMeasurementType[];
};

type NormalizedPhotoViewsResult = {
  values: ReportPhotoView[];
  hasInvalidValues: boolean;
};

type TemplateFormState = {
  name: string;
  description: string;
  fields: EditableTemplateField[];
};

type OrderedFieldLike = {
  localId?: string;
  key?: string | null;
  label?: string | null;
  type?: string | null;
  isRequired?: boolean;
  order?: number;
  moduleConfig?: unknown | null;
};

const props = defineProps<{
  redirectPath?: string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const { confirm } = useConfirmDialog();

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
  {
    label: t("trainerMemberDetails.trainerReportTemplates.fieldTypes.text"),
    value: ReportTemplateFieldRequestType.Text,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.fieldTypes.number"),
    value: ReportTemplateFieldRequestType.Number,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.fieldTypes.boolean"),
    value: ReportTemplateFieldRequestType.Boolean,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.fieldTypes.date"),
    value: ReportTemplateFieldRequestType.Date,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.fieldTypes.photos"),
    value: ReportTemplateFieldRequestType.Photos,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.fieldTypes.measurements"),
    value: ReportTemplateFieldRequestType.Measurements,
  },
]);

const photoViewOptions = computed(() => [
  {
    label: t("trainerMemberDetails.trainerReportTemplates.modules.photos.views.front"),
    value: "Front" as const,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.modules.photos.views.sideleft"),
    value: "SideLeft" as const,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.modules.photos.views.sideright"),
    value: "SideRight" as const,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.modules.photos.views.side"),
    value: "Side" as const,
  },
  {
    label: t("trainerMemberDetails.trainerReportTemplates.modules.photos.views.back"),
    value: "Back" as const,
  },
]);

const measurementModuleOptions = computed(() => [
  { label: t("trainerMemberDetails.measurements.bodyParts.BodyWeight"), value: "BodyWeight" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Chest"), value: "Chest" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Shoulders"), value: "Shoulders" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Biceps"), value: "Biceps" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Abs"), value: "Abs" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Calves"), value: "Calves" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Glutes"), value: "Glutes" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Neck"), value: "Neck" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Waist"), value: "Waist" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Hips"), value: "Hips" as const },
  { label: t("trainerMemberDetails.measurements.bodyParts.Thigh"), value: "Thigh" as const },
]);

const templateFieldCount = computed(() => templateForm.value.fields.length);

let templateToken = 0;
let nextTemplateFieldLocalId = 0;

const redirectPath = computed(() => props.redirectPath || "/trainer/report-templates");

const headers = computed(() => [
  {
    title: t("trainerMemberDetails.trainerReportTemplates.form.templateName"),
    key: "template",
    sortable: false,
  },
  {
    title: t("trainerMemberDetails.trainerReportTemplates.preview.fields"),
    key: "fields",
    sortable: false,
  },
  {
    title: t("trainerMemberDetails.trainerReportTemplates.actions.header"),
    key: "actions",
    sortable: false,
    align: "end" as const,
  },
]);

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

const toTemplate = (item: unknown) => item as ReportTemplateDto;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

const photoViewAliases: Record<string, ReportPhotoView> = {
  front: "Front",
  "przód": "Front",
  przod: "Front",
  side: "Side",
  bok: "Side",
  sideleft: "SideLeft",
  "side left": "SideLeft",
  "bok lewy": "SideLeft",
  sideright: "SideRight",
  "side right": "SideRight",
  "bok prawy": "SideRight",
  back: "Back",
  tył: "Back",
  tyl: "Back",
};

const normalizePhotoViewValue = (value: string): ReportPhotoView | null => {
  const normalizedKey = value.trim().toLowerCase();
  return photoViewAliases[normalizedKey] ?? null;
};

const normalizePhotoViews = (values: string[]): NormalizedPhotoViewsResult => {
  const seen = new Set<string>();
  const normalizedValues: ReportPhotoView[] = [];
  let hasInvalidValues = false;

  values.forEach((value) => {
    const normalizedValue = normalizePhotoViewValue(value);

    if (!normalizedValue) {
      hasInvalidValues = true;
      return;
    }

    if (seen.has(normalizedValue)) {
      return;
    }

    seen.add(normalizedValue);
    normalizedValues.push(normalizedValue);
  });

  return {
    values: normalizedValues,
    hasInvalidValues,
  };
};

const measurementTypeAliases: Record<string, ReportMeasurementType> = {
  weight: "BodyWeight",
  bodyweight: "BodyWeight",
  bodyfat: "BodyFat",
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abs: "Abs",
  quads: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
  glutes: "Glutes",
  neck: "Neck",
  waist: "Waist",
  hips: "Hips",
  thighs: "Thigh",
  thigh: "Thigh",
};

const createDefaultModuleConfig = (
  type: ReportTemplateFieldRequest["type"],
): EditableTemplateFieldModuleConfig => {
    if (type === ReportTemplateFieldRequestType.Photos) {
      return {
        requiredViews: ["Front", "SideLeft", "SideRight", "Back"],
        measurementTypes: [],
      };
    }

  if (type === ReportTemplateFieldRequestType.Measurements) {
    return {
      requiredViews: [],
      measurementTypes: ["BodyWeight", "Chest", "Waist"],
    };
  }

  return {
    requiredViews: [],
    measurementTypes: [],
  };
};

const normalizeModuleConfig = (
  type: ReportTemplateFieldRequest["type"],
  moduleConfig: unknown,
): EditableTemplateFieldModuleConfig => {
  const fallback = createDefaultModuleConfig(type);
  if (!isRecord(moduleConfig)) {
    return fallback;
  }

  return {
    requiredViews:
      type === ReportTemplateFieldRequestType.Photos
        ? normalizePhotoViews(getStringArray(moduleConfig.requiredViews)).values
        : fallback.requiredViews,
    measurementTypes:
      type === ReportTemplateFieldRequestType.Measurements
        ? getStringArray(moduleConfig.measurementTypes)
            .map((item) => measurementTypeAliases[item.trim().toLowerCase()] ?? null)
            .filter((item): item is ReportMeasurementType => item !== null)
        : fallback.measurementTypes,
  };
};

const isModuleFieldType = (type: ReportTemplateFieldRequest["type"]) =>
  type === ReportTemplateFieldRequestType.Photos ||
  type === ReportTemplateFieldRequestType.Measurements;

const getPhotoViewLabel = (value: string) => {
  const translationKey = `trainerMemberDetails.trainerReportTemplates.modules.photos.views.${value.toLowerCase()}`;
  const translated = t(translationKey);
  return translated !== translationKey ? translated : value;
};

const getMeasurementTypeLabel = (value: string) =>
  t(`trainerMemberDetails.measurements.bodyParts.${value}`);

const createEditableField = (
  field?: Partial<Omit<EditableTemplateField, "localId">>,
): EditableTemplateField => ({
  localId: `template-field-${++nextTemplateFieldLocalId}`,
  key: field?.key ?? "",
  label: field?.label ?? "",
  type: field?.type ?? ReportTemplateFieldRequestType.Text,
  isRequired: field?.isRequired ?? false,
  order: field?.order ?? templateForm.value.fields.length + 1,
  moduleConfig:
    field?.moduleConfig ?? createDefaultModuleConfig(field?.type ?? ReportTemplateFieldRequestType.Text),
});

const getFieldTypeLabel = (value: ReportTemplateFieldRequest["type"]) => {
  return fieldTypeOptions.value.find((option) => option.value === value)?.label ?? value;
};

const getFieldModuleDescription = (value: ReportTemplateFieldRequest["type"]) => {
  if (value === ReportTemplateFieldRequestType.Photos) {
    return t("trainerMemberDetails.trainerReportTemplates.modules.photos.description");
  }

  if (value === ReportTemplateFieldRequestType.Measurements) {
    return t("trainerMemberDetails.trainerReportTemplates.modules.measurements.description");
  }

  return "";
};

const getFieldModuleConfigSummary = (
  field: Pick<EditableTemplateField, "type" | "moduleConfig"> | OrderedFieldLike,
) => {
  const normalized = normalizeModuleConfig(
    (field.type as ReportTemplateFieldRequest["type"]) ?? ReportTemplateFieldRequestType.Text,
    field.moduleConfig,
  );

  if (field.type === ReportTemplateFieldRequestType.Photos) {
    return normalized.requiredViews.map(getPhotoViewLabel).join(", ");
  }

  if (field.type === ReportTemplateFieldRequestType.Measurements) {
    return normalized.measurementTypes.map(getMeasurementTypeLabel).join(", ");
  }

  return "";
};

const getTemplateFieldPreviewLabel = (field: OrderedFieldLike | ReportTemplateFieldDto) => {
  const baseLabel = field.label || field.key || t("trainerMemberDetails.trainerReportTemplates.fallback.noTemplateName");
  const typeLabel = getFieldTypeLabel(field.type as ReportTemplateFieldRequest["type"]);
  const moduleSummary = getFieldModuleConfigSummary(field);

  return moduleSummary ? `${baseLabel} · ${typeLabel} · ${moduleSummary}` : `${baseLabel} · ${typeLabel}`;
};

const onFieldTypeChange = (
  field: EditableTemplateField,
  value: ReportTemplateFieldRequest["type"],
) => {
  field.type = value;
  field.moduleConfig = createDefaultModuleConfig(value);
};

const syncTemplateFieldOrders = () => {
  templateForm.value.fields = templateForm.value.fields.map((field, index) => ({
    ...field,
    order: index + 1,
  }));
};

const resetTemplateForm = () => {
  templateForm.value = {
    name: "",
    description: "",
    fields: [],
  };
};

const appendField = () => {
  templateForm.value.fields.push(createEditableField());
  syncTemplateFieldOrders();
};

const removeField = (index: number) => {
  templateForm.value.fields.splice(index, 1);
  syncTemplateFieldOrders();
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
          fields: orderedFields(data.fields).map((field) =>
            createEditableField({
              key: field.key ?? "",
              label: field.label ?? "",
              type:
                (field.type as ReportTemplateFieldRequest["type"]) ??
                ReportTemplateFieldRequestType.Text,
              isRequired: Boolean(field.isRequired),
              order: field.order ?? 0,
              moduleConfig: normalizeModuleConfig(
                (field.type as ReportTemplateFieldRequest["type"]) ?? ReportTemplateFieldRequestType.Text,
                field.moduleConfig,
              ),
            }),
          ),
        };
        syncTemplateFieldOrders();
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
      normalizedPhotoViews:
        field.type === ReportTemplateFieldRequestType.Photos
          ? normalizePhotoViews(field.moduleConfig.requiredViews)
          : null,
      key: field.key.trim(),
      label: field.label.trim(),
      type: field.type,
      isRequired: field.isRequired,
      order: index + 1,
      moduleConfig: (() => {
        if (field.type === ReportTemplateFieldRequestType.Photos) {
          return {
            requiredViews: normalizePhotoViews(field.moduleConfig.requiredViews).values,
          };
        }

        if (field.type === ReportTemplateFieldRequestType.Measurements) {
          return { measurementTypes: field.moduleConfig.measurementTypes };
        }

        return null;
      })(),
    }))
    .filter((field) => field.key && field.label && field.type);

  if (fields.length === 0) {
    toast.error("trainerMemberDetails.trainerReportTemplates.feedback.templateFieldRequired");
    return;
  }

  const hasInvalidModuleConfig = fields.some((field) => {
    if (field.type === ReportTemplateFieldRequestType.Photos) {
      return (
        field.normalizedPhotoViews?.hasInvalidValues === true ||
        !Array.isArray(field.moduleConfig?.requiredViews) ||
        field.moduleConfig.requiredViews.length === 0
      );
    }

    if (field.type === ReportTemplateFieldRequestType.Measurements) {
      return !Array.isArray(field.moduleConfig?.measurementTypes) || field.moduleConfig.measurementTypes.length === 0;
    }

    return false;
  });

  if (hasInvalidModuleConfig) {
    toast.error("trainerMemberDetails.trainerReportTemplates.feedback.moduleConfigRequired");
    return;
  }

  isSavingTemplate.value = true;

  try {
    const payload: UpsertReportTemplateRequest = {
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

  const confirmed = await confirm({
    title: t("trainerMemberDetails.trainerReportTemplates.actions.deleteTemplate"),
    description: t("trainerMemberDetails.trainerReportTemplates.actions.deleteTemplateConfirm", {
      name: template.name || t("trainerMemberDetails.trainerReportTemplates.fallback.noTemplateName"),
    }),
    confirmLabel: t("trainerMemberDetails.trainerReportTemplates.actions.deleteTemplate"),
    cancelLabel: t("trainerMemberDetails.trainerReportTemplates.actions.cancel"),
    confirmColor: "error",
    isDestructive: true,
  });
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
.report-template-dialog {
  background: var(--lgym-surface-card);
  box-shadow: var(--lgym-shadow-surface);
  border: 1px solid var(--lgym-border);
  max-height: min(92vh, 960px);
  display: flex;
  flex-direction: column;
}

.template-dialog-hero {
  border-bottom: 1px solid var(--lgym-border);
  background: var(--lgym-surface-card);
}

.template-dialog-panel {
  border: 0;
  border-radius: 0.625rem;
  padding: 1.25rem;
  background: var(--lgym-note-bg);
}

.template-dialog-stat {
  border-radius: 0.5rem;
  padding: 0.75rem 0.875rem;
  background: color-mix(in srgb, var(--lgym-surface-card) 82%, transparent);
}

.template-fields-head {
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1.15fr) 140px 96px 132px 44px;
  gap: 0.75rem;
  align-items: center;
  color: var(--lgym-text-muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.template-field-card {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
}

.template-fields-scroll {
  overflow-y: auto;
  max-height: min(48vh, 460px);
  padding-right: 0.125rem;
  padding-bottom: 0.125rem;
}

.template-field-grid {
  display: grid;
  gap: 0.875rem;
}

@media (min-width: 768px) {
  .template-field-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

@media (min-width: 1280px) {
  .template-field-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1.15fr) 140px 96px 132px 44px;
    align-items: center;
  }
}

.template-field-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: var(--lgym-note-bg);
  color: rgb(var(--v-theme-primary));
  font-size: 0.8rem;
  font-weight: 700;
}

.template-field-index--order {
  color: var(--lgym-text);
}

.template-drag-handle {
  cursor: grab;
}

.template-drag-handle:active {
  cursor: grabbing;
}

.template-drag-button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 0.5rem;
  padding-inline: 0.65rem;
  background: var(--lgym-surface-elevated);
  color: var(--lgym-text-muted);
  transition: background-color 0.18s ease, color 0.18s ease;
}

.template-drag-button:hover {
  background: var(--lgym-note-bg);
  color: var(--lgym-text);
}

.template-drag-slot {
  min-width: 0;
}

.template-field-control :deep(.v-field) {
  border-radius: 0.5rem;
  min-height: 44px;
  background: var(--lgym-surface-elevated);
}

.template-field-control :deep(.v-field--variant-outlined .v-field__outline) {
  opacity: 1;
}

.template-field-control :deep(.v-field--variant-outlined .v-field__outline__start),
.template-field-control :deep(.v-field--variant-outlined .v-field__outline__notch),
.template-field-control :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-color: var(--lgym-border-strong);
}

.template-field-control :deep(.v-field__input) {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

.template-inline-checkbox {
  margin: 0;
}

.template-checkbox-wrap {
  border: 0;
  border-radius: 0.5rem;
  padding-inline: 0.65rem;
  background: var(--lgym-surface-elevated);
}

.template-inline-checkbox :deep(.v-selection-control) {
  min-height: 44px;
}

.template-inline-checkbox :deep(.v-label) {
  font-size: 0.875rem;
  white-space: nowrap;
}

.template-empty-state {
  border: 1px dashed var(--lgym-border);
  border-radius: 0.625rem;
  padding: 1.25rem;
  background: var(--lgym-surface-card);
}

.template-module-config-panel {
  margin-top: 0.75rem;
  grid-column: 1 / -1;
  border-radius: 0.75rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--lgym-surface-card) 78%, transparent);
}

.template-field-ghost {
  opacity: 0.6;
}

.template-field-chosen,
.template-field-drag {
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
}

@media (min-width: 1024px) {
  .template-field-row :deep(.v-label) {
    display: none;
  }
}
</style>
