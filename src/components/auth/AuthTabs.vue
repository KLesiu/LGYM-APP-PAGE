<template>
  <div class="rounded-[0.85rem] bg-[var(--lgym-tab-track)] p-1">
    <v-tabs
      v-model="selectedRole"
      color="primary"
      grow
      align-tabs="center"
      class="auth-tabs"
    >
      <v-tab
        v-for="role in roleOptions"
        :key="role.value"
        :value="role.value"
        rounded="md"
        :class="tabClass(role.value)"
      >
        {{ role.label }}
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type AuthRole = "athlete" | "trainer";

const { t } = useI18n();

const props = defineProps<{
  modelValue: AuthRole;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: AuthRole];
}>();

const selectedRole = computed({
  get: () => props.modelValue,
  set: (value: AuthRole) => emit("update:modelValue", value),
});

const roleOptions = computed(() => [
  {
    value: "athlete" as const,
    label: t("auth.tabs.athlete"),
  },
  {
    value: "trainer" as const,
    label: t("auth.tabs.trainer"),
  },
]);

const tabClass = (role: AuthRole) => [
  "min-h-7 px-4 normal-case text-sm! font-medium! tracking-normal! shadow-none!",
  props.modelValue === role
    ? "bg-[var(--lgym-tab-active)]! text-[var(--lgym-tab-active-text)]!"
    : "bg-transparent! text-[var(--lgym-tab-idle-text)]!",
];
</script>

<style scoped>
.auth-tabs :deep(.v-slide-group__content) {
  gap: 0.375rem;
}
</style>
