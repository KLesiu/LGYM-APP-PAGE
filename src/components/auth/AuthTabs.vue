<template>
  <div
    class="flex h-9 w-full gap-1.5 rounded-[0.85rem] bg-[var(--lgym-tab-track)] p-1"
  >
    <v-btn
      variant="flat"
      :class="tabClass('athlete')"
      @click="updateRole('athlete')"
    >
      {{ t("auth.tabs.athlete") }}
    </v-btn>

    <v-btn
      variant="flat"
      :class="tabClass('trainer')"
      @click="updateRole('trainer')"
    >
      {{ t("auth.tabs.trainer") }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

type AuthRole = "athlete" | "trainer";

const { t } = useI18n();

const props = defineProps<{
  modelValue: AuthRole;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: AuthRole];
}>();

const updateRole = (value: AuthRole) => {
  emit("update:modelValue", value);
};

const tabClass = (role: AuthRole) => [
  "flex-1 h-full! min-w-0! rounded-md! text-sm! font-medium! tracking-normal! shadow-none!",
  props.modelValue === role
    ? "bg-[var(--lgym-tab-active)]! text-[var(--lgym-tab-active-text)]!"
    : "bg-transparent! text-[var(--lgym-tab-idle-text)]!",
];
</script>
