<template>
  <v-card
    rounded="[32px]"
    class="flex h-full min-h-0 flex-col overflow-hidden border border-[var(--lgym-border)] bg-[var(--lgym-surface-card)] shadow-[var(--lgym-shadow-surface)]"
  >
    <div class="border-b border-[var(--lgym-border)] px-6 py-6">
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="space-y-2">
          <p
            class="text-[var(--lgym-primary)] text-xs font-semibold uppercase tracking-[0.24em]"
          >
            {{ t("admin.versions.eyebrow") }}
          </p>
          <div>
            <h2 class="text-[var(--lgym-text)] text-2xl font-semibold">
              {{ t("admin.versions.title") }}
            </h2>
            <p
              class="text-[var(--lgym-text-muted)] mt-3 max-w-3xl text-sm leading-6"
            >
              {{ t("admin.versions.subtitle") }}
            </p>
          </div>
        </div>

        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="isRefreshing"
          @click="refreshAll"
        >
          {{ t("admin.versions.actions.refresh") }}
        </v-btn>
      </div>

      <div
        class="border border-[var(--lgym-border)] bg-[var(--lgym-note-bg)] mt-6 rounded-[22px] p-3"
      >
        <v-tabs
          v-model="activePlatform"
          color="primary"
          grow
          class="admin-platform-tabs"
        >
          <v-tab
            v-for="platform in platformOptions"
            :key="platform.value"
            :value="platform.value"
            class="min-h-[46px] rounded-[18px] normal-case tracking-normal font-semibold"
          >
            <div class="flex items-center gap-2">
              <v-icon :icon="platform.icon" size="18" />
              <span>{{ platform.label }}</span>
            </div>
          </v-tab>
        </v-tabs>
      </div>
    </div>

    <v-card-text class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
      <v-window v-model="activePlatform" class="h-full min-h-0">
        <v-window-item
          v-for="platform in platformOptions"
          :key="platform.value"
          :value="platform.value"
          class="h-full min-h-0"
        >
          <div
            class="grid h-full min-h-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
          >
            <section class="space-y-4">
              <AdminVersionCurrentSummary
                :platform-label="platform.label"
                :current-config="states[platform.value].currentConfig"
                :is-loading="states[platform.value].isLoading"
              />

              <AdminVersionInfoNote
                :title="t('admin.versions.notes.title')"
                :description="t('admin.versions.notes.description')"
              />
            </section>

            <section>
              <AdminVersionEditForm
                :platform="platform.value"
                v-model:latest-version="states[platform.value].latestVersion"
                v-model:min-required-version="
                  states[platform.value].minRequiredVersion
                "
                v-model:update-url="states[platform.value].updateUrl"
                v-model:release-notes="states[platform.value].releaseNotes"
                v-model:force-update="states[platform.value].forceUpdate"
                :is-submitting="states[platform.value].isSubmitting"
                @submit="submitPlatform(platform.value)"
                @load-current="loadPlatform(platform.value)"
              />
            </section>
          </div>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import {
  postApiAppConfigCreateNewAppVersionId,
  postApiAppConfigGetAppVersion,
} from "../../api/generated/demo";
import {
  AppConfigInfoWithPlatformDtoPlatform,
  AppConfigVersionRequestDtoPlatform,
  type AppConfigInfoDto,
  type AppConfigInfoWithPlatformDto,
} from "../../api/model";
import { getAuthUserId } from "../../composables/useAuthSession";
import { useToast } from "../../composables/useToast";

import AdminVersionCurrentSummary from "./AdminVersionCurrentSummary.vue";
import AdminVersionEditForm from "./AdminVersionEditForm.vue";
import AdminVersionInfoNote from "./AdminVersionInfoNote.vue";

type VersionPlatform = "Android" | "Ios";

type VersionState = {
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  releaseNotes: string;
  forceUpdate: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  currentConfig: AppConfigInfoDto | null | undefined;
};

const emit = defineEmits<{
  unauthorized: [];
}>();

const { t } = useI18n();
const toast = useToast();

const activePlatform = ref<VersionPlatform>("Android");

const createEmptyState = (): VersionState => ({
  latestVersion: "",
  minRequiredVersion: "",
  updateUrl: "",
  releaseNotes: "",
  forceUpdate: false,
  isLoading: false,
  isSubmitting: false,
  currentConfig: undefined,
});

const states = reactive<Record<VersionPlatform, VersionState>>({
  Android: createEmptyState(),
  Ios: createEmptyState(),
});

const platformOptions = computed(() => [
  {
    value: "Android" as const,
    label: t("admin.versions.platforms.android"),
    icon: "mdi-android",
  },
  {
    value: "Ios" as const,
    label: t("admin.versions.platforms.ios"),
    icon: "mdi-apple-ios",
  },
]);

const isRefreshing = computed(
  () => states.Android.isLoading || states.Ios.isLoading,
);

const platformRequestMap: Record<
  VersionPlatform,
  AppConfigVersionRequestDtoPlatform
> = {
  Android: AppConfigVersionRequestDtoPlatform.Android,
  Ios: AppConfigVersionRequestDtoPlatform.Ios,
};

const platformCreateMap: Record<
  VersionPlatform,
  AppConfigInfoWithPlatformDtoPlatform
> = {
  Android: AppConfigInfoWithPlatformDtoPlatform.Android,
  Ios: AppConfigInfoWithPlatformDtoPlatform.Ios,
};

const isUnauthorizedStatus = (status: number) =>
  status === 401 || status === 403;

const syncFormWithCurrentConfig = (
  platform: VersionPlatform,
  config: AppConfigInfoDto | null | undefined,
) => {
  if (!config) return;

  states[platform].latestVersion = config.latestVersion ?? "";
  states[platform].minRequiredVersion = config.minRequiredVersion ?? "";
  states[platform].updateUrl = config.updateUrl ?? "";
  states[platform].releaseNotes = config.releaseNotes ?? "";
  states[platform].forceUpdate = config.forceUpdate ?? false;
};

const loadPlatform = async (platform: VersionPlatform) => {
  const state = states[platform];
  state.isLoading = true;

  try {
    const response = await postApiAppConfigGetAppVersion({
      platform: platformRequestMap[platform],
    });

    if (isUnauthorizedStatus(response.status)) {
      emit("unauthorized");
      return;
    }

    if (response.status === 404) {
      state.currentConfig = null;
      return;
    }

    if (response.status !== 200) {
      state.currentConfig = undefined;
      toast.error("admin.versions.feedback.loadFailed");
      return;
    }

    state.currentConfig = response.data;
    syncFormWithCurrentConfig(platform, response.data);
  } catch (error: unknown) {
    console.error(error);
    state.currentConfig = undefined;
    toast.error("admin.versions.feedback.loadFailed");
  } finally {
    state.isLoading = false;
  }
};

const validateState = (platform: VersionPlatform) => {
  const state = states[platform];

  if (!state.latestVersion.trim()) {
    toast.warning("admin.versions.feedback.latestVersionRequired");
    return false;
  }

  if (!state.minRequiredVersion.trim()) {
    toast.warning("admin.versions.feedback.minVersionRequired");
    return false;
  }

  return true;
};

const submitPlatform = async (platform: VersionPlatform) => {
  const state = states[platform];
  const adminUserId = getAuthUserId();

  if (!adminUserId) {
    toast.error("admin.feedback.unauthorized");
    return;
  }

  if (!validateState(platform)) return;

  state.isSubmitting = true;

  try {
    const payload: AppConfigInfoWithPlatformDto = {
      latestVersion: state.latestVersion.trim(),
      minRequiredVersion: state.minRequiredVersion.trim(),
      updateUrl: state.updateUrl.trim() || null,
      releaseNotes: state.releaseNotes.trim() || null,
      forceUpdate: state.forceUpdate,
      platform: platformCreateMap[platform],
    };

    const response = await postApiAppConfigCreateNewAppVersionId(
      adminUserId,
      payload,
    );

    if (isUnauthorizedStatus(response.status)) {
      emit("unauthorized");
      return;
    }

    if (response.status !== 201) {
      toast.error("admin.versions.feedback.submitFailed");
      return;
    }

    toast.success("admin.versions.feedback.submitSuccess");
    await loadPlatform(platform);
  } catch (error: unknown) {
    console.error(error);
    toast.error("admin.versions.feedback.submitFailed");
  } finally {
    state.isSubmitting = false;
  }
};

const refreshAll = async () => {
  await Promise.all([loadPlatform("Android"), loadPlatform("Ios")]);
};

defineExpose({
  refreshAll,
});

onMounted(async () => {
  await refreshAll();
});
</script>

<style scoped>
.admin-platform-tabs {
  --v-theme-primary: var(--lgym-primary-rgb);
}

.admin-platform-tabs :deep(.v-slide-group__content) {
  gap: 0.5rem;
}

.admin-platform-tabs :deep(.v-tab) {
  color: var(--lgym-tab-idle-text);
}

.admin-platform-tabs :deep(.v-tab--selected) {
  background: var(--lgym-tab-active);
  color: var(--lgym-tab-active-text);
}
</style>
