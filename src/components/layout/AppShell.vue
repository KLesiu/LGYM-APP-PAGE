<template>
  <div
    class="grid h-screen overflow-hidden bg-[var(--lgym-page-glow),var(--lgym-bg)] supports-[height:100dvh]:h-[100dvh] lg:grid-cols-[288px_1fr]"
  >
    <!-- Desktop Sidebar -->
    <AppSidebar
      :items="sidebarItems"
      :active-item="activeSidebarItem"
      :logo-src="logoSrc"
      :brand-name="brandName"
      :brand-subtitle="brandSubtitle"
      class="hidden lg:flex"
    >
      <template v-if="$slots['sidebar-footer']" #footer>
        <slot name="sidebar-footer" />
      </template>
    </AppSidebar>

    <!-- Right column: header + content -->
    <div
      class="flex h-screen min-h-0 flex-col overflow-hidden supports-[height:100dvh]:h-[100dvh]"
    >
      <AppHeader
        :title="headerTitle"
        :subtitle="headerSubtitle"
        :user="user"
        @logout="$emit('logout')"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      >
        <template v-if="$slots['header-actions']" #actions>
          <slot name="header-actions" />
        </template>
      </AppHeader>

      <main class="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-5 lg:p-6">
        <slot />
      </main>
    </div>
  </div>

  <!-- Mobile Sidebar Overlay -->
  <Teleport to="body">
    <Transition name="sidebar-overlay">
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden">
        <!-- Scrim/backdrop -->
        <div
          class="absolute inset-0 bg-black/30"
          @click="sidebarOpen = false"
        />

        <!-- Sidebar panel -->
        <Transition name="sidebar-slide">
          <div
            v-if="sidebarOpen"
            class="relative z-10 h-full w-[288px] max-w-[calc(100vw-2rem)]"
          >
            <AppSidebar
              :items="sidebarItems"
              :active-item="activeSidebarItem"
              :logo-src="logoSrc"
              :brand-name="brandName"
              :brand-subtitle="brandSubtitle"
              @item-click="handleMobileNavClick"
            >
              <template v-if="$slots['sidebar-footer']" #footer>
                <slot name="sidebar-footer" />
              </template>
            </AppSidebar>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import type { SidebarItem } from "./AppSidebar.vue";
import type { CurrentUser } from "../../composables/useCurrentUser";

defineProps<{
  sidebarItems: SidebarItem[];
  activeSidebarItem: string;
  logoSrc: string;
  brandName: string;
  brandSubtitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  user: CurrentUser | null;
}>();

defineEmits<{
  logout: [];
}>();

const sidebarOpen = ref(false);
const route = useRoute();

// Close sidebar on navigation change
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  },
);

// Close the mobile sidebar immediately on menu interaction.
function handleMobileNavClick() {
  sidebarOpen.value = false;
}
</script>

<style scoped>
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 200ms ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 200ms ease;
}
.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}
</style>
