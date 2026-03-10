<template>
  <div class="admin-layout">
    <AppSidebar
      :active-path="route.path"
      :is-open="isSidebarOpen"
      :modules="modules"
      @navigate="closeSidebar"
    />

    <div class="admin-main">
      <header class="admin-header">
        <div class="header-left">
          <button class="sidebar-toggle" type="button" @click="toggleSidebar">
            <i class="bi bi-list" />
          </button>
          <div>
            <div class="header-kicker">{{ currentModule?.phase ?? 'Pawnshop Web' }}</div>
            <h1 class="header-title">{{ headerTitle }}</h1>
          </div>
        </div>

        <div class="header-right">
          <div class="header-user-card">
            <div class="header-user-role">System Workspace</div>
            <div class="header-user-name">Single-repo build</div>
          </div>
        </div>
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

import { getAppModuleByRoute, getAppModules } from '@core/data/datasources/app_module_catalog';
import AppSidebar from '@core/presentation/components/app_sidebar.view.vue';

const route = useRoute();
const modules = getAppModules();
const isSidebarOpen = ref(false);

const currentModule = computed(() => getAppModuleByRoute(route.path));
const headerTitle = computed(() => {
  const routeTitle = route.meta.title;
  if (typeof routeTitle === 'string' && routeTitle.length > 0) {
    return routeTitle;
  }

  return currentModule.value?.title ?? 'Dashboard';
});

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
