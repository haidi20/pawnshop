<template>
  <div
    class="admin-layout"
    :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }"
  >
    <AppSidebar
      :active-path="route.path"
      :is-open="isSidebarOpen"
      :is-collapsed="isSidebarCollapsed"
      :items="navigationItems"
      @navigate="closeSidebar"
    />

    <div class="admin-main">
      <header class="admin-header">
        <button
          class="admin-header-sidebar-button"
          type="button"
          :title="sidebarToggleTitle"
          :aria-label="sidebarToggleTitle"
          @click="toggleSidebarVisibility"
        >
          <i
            class="bi"
            :class="sidebarToggleIcon"
          />
        </button>

        <div
          class="admin-header-spacer"
          aria-hidden="true"
        />

        <button
          class="admin-header-user-button"
          type="button"
          title="Menu pengguna akan tersedia nanti"
          aria-label="Ikon pengguna"
        >
          <i class="bi bi-person-circle" />
        </button>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import { getAppNavigationItems } from '@core/data/datasources/app_module_catalog';
import AppSidebar from '@core/presentation/components/app_sidebar.view.vue';

const route = useRoute();
const navigationItems = getAppNavigationItems();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const mobileSidebarBreakpoint = 920;

const toggleSidebar = (): void => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = (): void => {
  isSidebarOpen.value = false;
};

const toggleSidebarCollapse = (): void => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const isCompactViewport = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(`(max-width: ${mobileSidebarBreakpoint}px)`).matches;

const toggleSidebarVisibility = (): void => {
  if (isCompactViewport()) {
    toggleSidebar();
    return;
  }

  toggleSidebarCollapse();
};

const sidebarToggleTitle = computed<string>(() =>
  isCompactViewport()
    ? isSidebarOpen.value
      ? 'Tutup sidebar'
      : 'Buka sidebar'
    : isSidebarCollapsed.value
      ? 'Tampilkan sidebar penuh'
      : 'Sembunyikan teks sidebar'
);

const sidebarToggleIcon = computed<string>(() =>
  isCompactViewport()
    ? isSidebarOpen.value
      ? 'bi-x-lg'
      : 'bi-list'
    : isSidebarCollapsed.value
      ? 'bi-layout-sidebar-inset'
      : 'bi-layout-sidebar'
);

watch(
  () => route.path,
  () => {
    closeSidebar();
  }
);
</script>
