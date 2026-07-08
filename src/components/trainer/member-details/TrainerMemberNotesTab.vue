<template>
  <div class="flex min-h-0 min-w-0 flex-col gap-4">
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] px-5 py-6 sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
              {{ t("trainerMemberDetails.notes.eyebrow") }}
            </p>
            <h2 class="mt-2 text-2xl font-semibold text-[var(--lgym-text)] sm:text-3xl">
              {{ t("trainerMemberDetails.notes.title") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-[var(--lgym-text-muted)]">{{ notesCountLabel }}</p>
          </div>

          <v-btn color="primary" class="min-h-10 rounded-md px-4" @click="openCreateDialog">
            {{ t("trainerMemberDetails.notes.actions.create") }}
          </v-btn>
        </div>

        <p class="max-w-3xl text-sm leading-6 text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.notes.subtitle") }}
        </p>
      </div>

      <v-progress-linear v-if="isLoading" indeterminate color="primary" />

      <div v-if="hasError && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
        <p class="text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.notes.error.load") }}
        </p>
        <v-btn class="mt-4" color="primary" variant="outlined" @click="loadNotes">
          {{ t("trainerMemberDetails.actions.retry") }}
        </v-btn>
      </div>

      <div v-else-if="notes.length === 0 && !isLoading" class="rounded-md border border-dashed border-[var(--lgym-border)] px-6 py-10 text-center">
        <p class="text-base font-semibold text-[var(--lgym-text)]">
          {{ t("trainerMemberDetails.notes.empty.title") }}
        </p>
        <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
          {{ t("trainerMemberDetails.notes.empty.subtitle") }}
        </p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="note in sortedNotes"
          :key="note._id || note.title || 'note'"
          class="group cursor-pointer overflow-hidden rounded-[28px] border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)] transition hover:-translate-y-0.5 hover:border-[var(--lgym-primary)]/50"
          @click="openNotePreview(note)"
        >
          <div class="flex h-full flex-col gap-4 px-5 py-5 sm:px-6">
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex flex-wrap items-start gap-3">
                <h3 class="flex-1 text-lg font-semibold text-[var(--lgym-text)]">
                  {{ note.title || t("trainerMemberDetails.notes.fallback.noTitle") }}
                </h3>
                <v-chip v-if="note.visibleToTrainee" color="primary" size="small" variant="outlined">
                  {{ t("trainerMemberDetails.notes.badges.visible") }}
                </v-chip>
                <v-chip v-if="note.isPinned" color="secondary" size="small" variant="outlined">
                  {{ t("trainerMemberDetails.notes.badges.pinned") }}
                </v-chip>
              </div>
              <p class="mt-2 text-xs text-[var(--lgym-text-soft)]">
                {{ t("trainerMemberDetails.notes.meta.updatedAt") }}: {{ formatDateTime(note.lastUpdatedAt) }}
              </p>
              <p class="note-card-preview mt-4 whitespace-pre-line text-sm leading-7 text-[var(--lgym-text-muted)]">
                {{ getNotePreview(note.content) }}
              </p>
            </div>

            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lgym-primary)]">Open note</p>
          </div>
        </article>
      </div>
    </section>

    <v-dialog v-model="isPreviewOpen" max-width="920">
      <v-card
        rounded="lg"
        class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]"
      >
        <template v-if="selectedPreviewNote">
          <div class="border-b border-[var(--lgym-border)] px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lgym-primary)]">
                  {{ t("trainerMemberDetails.notes.eyebrow") }}
                </p>
                <h3 class="mt-2 text-2xl font-semibold text-[var(--lgym-text)]">
                  {{ selectedPreviewNote.title || t("trainerMemberDetails.notes.fallback.noTitle") }}
                </h3>
                <p class="mt-2 text-sm text-[var(--lgym-text-muted)]">
                  {{ t("trainerMemberDetails.notes.meta.updatedAt") }}: {{ formatDateTime(selectedPreviewNote.lastUpdatedAt) }}
                </p>
              </div>

              <v-btn icon="mdi-close" variant="text" @click="closeNotePreview" />
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <v-chip v-if="selectedPreviewNote.visibleToTrainee" color="primary" size="small" variant="outlined">
                {{ t("trainerMemberDetails.notes.badges.visible") }}
              </v-chip>
              <v-chip v-if="selectedPreviewNote.isPinned" color="secondary" size="small" variant="outlined">
                {{ t("trainerMemberDetails.notes.badges.pinned") }}
              </v-chip>
            </div>
          </div>

          <v-card-text class="px-6 py-6">
            <div class="grid gap-5">
              <div class="rounded-3xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-5 py-5">
                <p class="whitespace-pre-line text-sm leading-7 text-[var(--lgym-text-muted)]">
                  {{ selectedPreviewNote.content || t("trainerMemberDetails.notes.fallback.noContent") }}
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    {{ t("trainerMemberDetails.notes.meta.updatedAt") }}
                  </p>
                  <p class="mt-2 text-sm text-[var(--lgym-text)]">
                    {{ formatDateTime(selectedPreviewNote.lastUpdatedAt) }}
                  </p>
                </div>
                <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lgym-text-soft)]">
                    Created at
                  </p>
                  <p class="mt-2 text-sm text-[var(--lgym-text)]">
                    {{ formatDateTime(selectedPreviewNote.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="flex-wrap justify-end gap-3 px-6 pb-6">
            <v-btn variant="text" @click="closeNotePreview">
              {{ t("trainerMemberDetails.actions.close") }}
            </v-btn>
            <v-btn variant="outlined" color="secondary" class="min-h-10 rounded-md px-4" @click="openHistoryDialog(selectedPreviewNote)">
              {{ t("trainerMemberDetails.notes.actions.history") }}
            </v-btn>
            <v-btn variant="outlined" color="primary" class="min-h-10 rounded-md px-4" @click="openEditDialog(selectedPreviewNote)">
              {{ t("trainerMemberDetails.notes.actions.edit") }}
            </v-btn>
            <v-btn variant="outlined" color="error" class="min-h-10 rounded-md px-4" :loading="deletingNoteId === selectedPreviewNote._id" @click="deleteNote(selectedPreviewNote)">
              {{ t("trainerMemberDetails.notes.actions.delete") }}
            </v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEditorOpen" max-width="760">
      <v-card rounded="lg" class="border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)]">
        <div class="border-b border-[var(--lgym-border)] px-6 py-5">
          <h3 class="text-xl font-semibold text-[var(--lgym-text)]">
            {{ editingNoteId ? t("trainerMemberDetails.notes.dialog.editTitle") : t("trainerMemberDetails.notes.dialog.createTitle") }}
          </h3>
        </div>

        <v-card-text class="px-6 py-6">
          <div class="grid gap-5">
            <v-text-field v-model="form.title" :label="t('trainerMemberDetails.notes.form.title')" density="comfortable" variant="outlined" hide-details="auto" />
            <v-textarea v-model="form.content" rows="8" auto-grow density="comfortable" variant="outlined" hide-details="auto" :error-messages="validationErrors.content">
              <template #label>
                {{ t('trainerMemberDetails.notes.form.content') }} <span class="text-red-400">*</span>
              </template>
            </v-textarea>
            <div class="grid gap-3 md:grid-cols-2">
              <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-3">
                <v-switch v-model="form.visibleToTrainee" :label="t('trainerMemberDetails.notes.form.visibleToTrainee')" color="primary" inset hide-details class="w-full" />
              </div>
              <div class="rounded-2xl border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] px-4 py-3">
                <v-switch v-model="form.isPinned" :label="t('trainerMemberDetails.notes.form.isPinned')" color="primary" inset hide-details class="w-full" />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end gap-3 px-6 pb-6">
          <v-btn variant="text" @click="isEditorOpen = false">{{ t("trainerMemberDetails.actions.cancel") }}</v-btn>
          <v-btn color="primary" :loading="isSaving" @click="saveNote">{{ t("trainerMemberDetails.actions.save") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isHistoryOpen" max-width="760">
      <v-card rounded="lg">
        <v-card-title class="text-lg font-semibold">{{ t("trainerMemberDetails.notes.dialog.historyTitle") }}</v-card-title>
        <v-card-text class="px-6 py-5">
          <v-progress-linear v-if="isLoadingHistory" indeterminate color="primary" />
          <div v-else-if="historyEntries.length === 0" class="py-8 text-center text-sm text-[var(--lgym-text-muted)]">
            {{ t("trainerMemberDetails.notes.history.empty") }}
          </div>
          <div v-else class="grid gap-3">
            <article v-for="entry in historyEntries" :key="entry._id ?? entry.changedAt ?? entry.changeType ?? 'note-history'" class="rounded-md border border-[var(--lgym-border)] p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="font-semibold text-[var(--lgym-text)]">{{ entry.changeType || t("trainerMemberDetails.notes.history.unknown") }}</p>
                <span class="text-xs text-[var(--lgym-text-muted)]">{{ formatDateTime(entry.changedAt) }}</span>
              </div>
              <div class="mt-3 grid gap-3 text-sm">
                <div>
                  <p class="text-[var(--lgym-text-soft)]">{{ t("trainerMemberDetails.notes.history.previous") }}</p>
                  <p class="mt-1 whitespace-pre-line rounded-md bg-[var(--lgym-note-bg)] p-3 text-[var(--lgym-text-muted)]">
                    {{ entry.previousContent || t("trainerMemberDetails.notes.history.emptyValue") }}
                  </p>
                </div>
                <div>
                  <p class="text-[var(--lgym-text-soft)]">{{ t("trainerMemberDetails.notes.history.current") }}</p>
                  <p class="mt-1 whitespace-pre-line rounded-md bg-[var(--lgym-note-bg)] p-3 text-[var(--lgym-text)]">
                    {{ entry.newContent || t("trainerMemberDetails.notes.history.emptyValue") }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-6">
          <v-btn variant="text" @click="isHistoryOpen = false">{{ t("trainerMemberDetails.actions.close") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import {
  createTrainerTraineeNote,
  deleteTrainerTraineeNote,
  getTrainerTraineeNoteHistory,
  getTrainerTraineeNotes,
  updateTrainerTraineeNote,
  type TraineeNoteDto,
  type TraineeNoteHistoryDto,
  type UpsertTraineeNoteRequest,
} from "../../../api/trainerNotes";
import { getApiErrorMessage } from "../../../api/trainerInvitations";
import { useConfirmDialog } from "../../../composables/useConfirmDialog";
import { useToast } from "../../../composables/useToast";

const props = defineProps<{
  traineeId: string;
  formatDateTime: (value: string | null | undefined) => string;
}>();

const { t } = useI18n();
const toast = useToast();
const { confirm } = useConfirmDialog();

const notes = ref<TraineeNoteDto[]>([]);
const historyEntries = ref<TraineeNoteHistoryDto[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const isSaving = ref(false);
const isPreviewOpen = ref(false);
const isEditorOpen = ref(false);
const isHistoryOpen = ref(false);
const isLoadingHistory = ref(false);
const editingNoteId = ref<string | null>(null);
const deletingNoteId = ref<string | null>(null);
const selectedPreviewNoteId = ref<string | null>(null);
const validationErrors = ref<{ content: string[] }>({ content: [] });

const form = ref<UpsertTraineeNoteRequest>({
  title: "",
  content: "",
  visibleToTrainee: false,
  isPinned: false,
});

const sortedNotes = computed(() =>
  [...notes.value].sort((left, right) => {
    if (Boolean(left.isPinned) !== Boolean(right.isPinned)) {
      return left.isPinned ? -1 : 1;
    }

    const leftTime = left.lastUpdatedAt ? new Date(left.lastUpdatedAt).getTime() : 0;
    const rightTime = right.lastUpdatedAt ? new Date(right.lastUpdatedAt).getTime() : 0;
    return rightTime - leftTime;
  }),
);

const selectedPreviewNote = computed(
  () => sortedNotes.value.find((note) => note._id === selectedPreviewNoteId.value) ?? null,
);

const notesCountLabel = computed(() => {
  const pinnedCount = sortedNotes.value.filter((note) => note.isPinned).length;
  const totalCount = sortedNotes.value.length;

  if (pinnedCount === 0) {
    return `${totalCount} notes`;
  }

  return `${totalCount} notes · ${pinnedCount} pinned`;
});

const resetForm = () => {
  editingNoteId.value = null;
  validationErrors.value = { content: [] };
  form.value = {
    title: "",
    content: "",
    visibleToTrainee: false,
    isPinned: false,
  };
};

const getNotePreview = (content: string | null | undefined) => {
  const normalized = content?.trim();
  if (!normalized) {
    return t("trainerMemberDetails.notes.fallback.noContent");
  }

  return normalized;
};

const openNotePreview = (note: TraineeNoteDto) => {
  selectedPreviewNoteId.value = note._id || null;
  isPreviewOpen.value = true;
};

const closeNotePreview = () => {
  isPreviewOpen.value = false;
  selectedPreviewNoteId.value = null;
};

const loadNotes = async () => {
  if (!props.traineeId) return;
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await getTrainerTraineeNotes(props.traineeId);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to load notes");
    }

    notes.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const openCreateDialog = () => {
  resetForm();
  isEditorOpen.value = true;
};

const openEditDialog = (note: TraineeNoteDto) => {
  closeNotePreview();
  editingNoteId.value = note._id || null;
  validationErrors.value = { content: [] };
  form.value = {
    title: note.title || "",
    content: note.content || "",
    visibleToTrainee: Boolean(note.visibleToTrainee),
    isPinned: Boolean(note.isPinned),
  };
  isEditorOpen.value = true;
};

const validateForm = () => {
  const nextErrors = { content: [] as string[] };
  if (!form.value.content.trim()) {
    nextErrors.content.push(t("trainerMemberDetails.notes.validation.contentRequired"));
  }
  validationErrors.value = nextErrors;
  return nextErrors.content.length === 0;
};

const saveNote = async () => {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  try {
    const payload: UpsertTraineeNoteRequest = {
      title: form.value.title?.trim() || null,
      content: form.value.content.trim(),
      visibleToTrainee: form.value.visibleToTrainee,
      isPinned: form.value.isPinned,
    };

    const response = editingNoteId.value
      ? await updateTrainerTraineeNote(props.traineeId, editingNoteId.value, payload)
      : await createTrainerTraineeNote(props.traineeId, payload);

    if (![200, 201].includes(response.status)) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to save note");
    }

    isEditorOpen.value = false;
    await loadNotes();
    toast.successMessage(t("trainerMemberDetails.notes.feedback.saved"));
  } catch (error) {
    console.error(error);
    toast.errorMessage(error instanceof Error ? error.message : t("trainerMemberDetails.notes.feedback.saveFailed"));
  } finally {
    isSaving.value = false;
  }
};

const deleteNote = async (note: TraineeNoteDto) => {
  if (!note._id) return;

  const accepted = await confirm({
    title: t("trainerMemberDetails.notes.confirm.deleteTitle"),
    description: t("trainerMemberDetails.notes.confirm.deleteMessage", {
      name: note.title || t("trainerMemberDetails.notes.fallback.noTitle"),
    }),
    confirmLabel: t("trainerMemberDetails.notes.actions.delete"),
    cancelLabel: t("trainerMemberDetails.actions.cancel"),
    confirmColor: "error",
    isDestructive: true,
  });

  if (!accepted) return;

  deletingNoteId.value = note._id;
  try {
    const response = await deleteTrainerTraineeNote(props.traineeId, note._id);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to delete note");
    }

    if (selectedPreviewNoteId.value === note._id) {
      closeNotePreview();
    }

    await loadNotes();
    toast.successMessage(t("trainerMemberDetails.notes.feedback.deleted"));
  } catch (error) {
    console.error(error);
    toast.errorMessage(error instanceof Error ? error.message : t("trainerMemberDetails.notes.feedback.deleteFailed"));
  } finally {
    deletingNoteId.value = null;
  }
};

const openHistoryDialog = async (note: TraineeNoteDto) => {
  if (!note._id) return;
  closeNotePreview();
  isHistoryOpen.value = true;
  isLoadingHistory.value = true;

  try {
    const response = await getTrainerTraineeNoteHistory(props.traineeId, note._id);
    if (response.status !== 200) {
      throw new Error(getApiErrorMessage(response.data) || "Failed to load note history");
    }
    historyEntries.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    historyEntries.value = [];
    toast.errorMessage(error instanceof Error ? error.message : t("trainerMemberDetails.notes.feedback.historyFailed"));
  } finally {
    isLoadingHistory.value = false;
  }
};

watch(() => props.traineeId, () => void loadNotes(), { immediate: true });
</script>

<style scoped>
.note-card-preview {
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
