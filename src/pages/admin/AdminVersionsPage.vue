<template>
  <div class="flex h-full min-h-0 min-w-0 flex-col gap-4 lg:gap-5">
    <section class="grid h-full min-h-0 min-w-0 gap-4 lg:gap-5">
      <AdminAppVersionPanel @unauthorized="handleUnauthorized" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import AdminAppVersionPanel from "../../components/admin/AdminAppVersionPanel.vue";
import { clearAuthSession } from "../../composables/useAuthSession";
import { useToast } from "../../composables/useToast";

const router = useRouter();
const toast = useToast();

const handleUnauthorized = async () => {
  clearAuthSession();
  toast.error("admin.feedback.unauthorized");

  await router.push({
    name: "login-admin",
    query: {
      redirect: "/admin/versions",
    },
  });
};
</script>
