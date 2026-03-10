<template>
  <div class="admin-layout">
    <AppSidebar :active-path="route.path" :is-open="isSidebarOpen" :items="navigationItems" @navigate="closeSidebar" />

    <div class="admin-main">
      <button class="sidebar-toggle sidebar-toggle-floating" type="button" @click="toggleSidebar">
        <i class="bi bi-list" />
      </button>

      <header class="admin-header admin-header-empty">
        <!-- Header intentionally left empty -->
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import { getAppNavigationItems } from '@core/data/datasources/app_module_catalog';
import AppSidebar from '@core/presentation/components/app_sidebar.view.vue';

const route = useRoute();
const navigationItems = getAppNavigationItems();
const isSidebarOpen = ref(false);

const toggleSidebar = (): void => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = (): void => {
  isSidebarOpen.value = false;
};

watch(
  () => route.path,
  () => {
    closeSidebar();
  }
);
</script>
