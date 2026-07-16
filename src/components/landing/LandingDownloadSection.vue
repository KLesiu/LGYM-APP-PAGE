<template>
  <section id="download" class="px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28">
    <div class="landing-final-cta mx-auto max-w-7xl">
      <div>
        <p class="landing-eyebrow">{{ t("landing.download.eyebrow") }}</p>
        <h2>{{ t("landing.download.title") }}</h2>
        <p v-if="isLoading" class="landing-download-status">
          {{ t("landing.download.loading") }}
        </p>
        <p v-else-if="!availableStores.length" class="landing-download-status">
          {{ t("landing.download.unavailable") }}
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <a
          v-for="store in availableStores"
          :key="store.platform"
          class="landing-store-button"
          :href="store.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="store.ariaLabel"
        >
          <v-icon :icon="store.icon" size="30" />
          <span>{{ store.prefix }}</span>
          <strong>{{ store.label }}</strong>
          <small v-if="store.version">
            {{ t("landing.download.version", { version: store.version }) }}
          </small>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import { postApiAppConfigGetAppVersion } from "../../api/generated/demo";
import {
  AppConfigVersionRequestDtoPlatform,
  type AppConfigInfoDto,
} from "../../api/model";

const { t } = useI18n();

type StorePlatform = "ios" | "android";

type StoreConfig = {
  platform: StorePlatform;
  apiPlatform: AppConfigVersionRequestDtoPlatform;
  icon: string;
  label: string;
  prefixKey: string;
  ariaKey: string;
};

type StoreState = Record<StorePlatform, AppConfigInfoDto | null>;

const isLoading = ref(true);
const storeVersions = reactive<StoreState>({
  ios: null,
  android: null,
});

const storeConfigs: StoreConfig[] = [
  {
    platform: "ios",
    apiPlatform: AppConfigVersionRequestDtoPlatform.Ios,
    icon: "mdi-apple",
    label: "App Store",
    prefixKey: "landing.download.appStorePrefix",
    ariaKey: "landing.download.appStoreAria",
  },
  {
    platform: "android",
    apiPlatform: AppConfigVersionRequestDtoPlatform.Android,
    icon: "mdi-google-play",
    label: "Google Play",
    prefixKey: "landing.download.googlePlayPrefix",
    ariaKey: "landing.download.googlePlayAria",
  },
];

const availableStores = computed(() =>
  storeConfigs
    .map((store) => {
      const config = storeVersions[store.platform];
      const updateUrl = config?.updateUrl?.trim();

      if (!updateUrl) return null;

      return {
        ...store,
        url: updateUrl,
        version: config?.latestVersion?.trim() ?? "",
        prefix: t(store.prefixKey),
        ariaLabel: t(store.ariaKey),
      };
    })
    .filter((store): store is NonNullable<typeof store> => Boolean(store)),
);

const loadStoreVersion = async (store: StoreConfig) => {
  const response = await postApiAppConfigGetAppVersion({
    platform: store.apiPlatform,
  });

  if (response.status === 200) {
    storeVersions[store.platform] = response.data;
    return;
  }

  storeVersions[store.platform] = null;
};

onMounted(async () => {
  try {
    await Promise.allSettled(storeConfigs.map(loadStoreVersion));
  } finally {
    isLoading.value = false;
  }
});
</script>
