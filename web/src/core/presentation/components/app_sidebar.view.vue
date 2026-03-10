<template>
  <aside class="admin-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-brand">
      <div class="brand-mark">PS</div>
      <div>
        <div class="brand-title">Pawnshop</div>
        <div class="brand-subtitle">Operations Console</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="moduleItem in modules"
        :key="moduleItem.key"
        :to="moduleItem.route"
        class="sidebar-link"
        :class="{ active: activePath === moduleItem.route || activePath.startsWith(`${moduleItem.route}/`) }"
        @click="$emit('navigate')"
      >
        <span class="sidebar-link-icon">
          <i class="bi" :class="moduleItem.icon" />
        </span>
        <span class="sidebar-link-content">
          <span class="sidebar-link-title">{{ moduleItem.shortTitle }}</span>
          <span class="sidebar-link-subtitle">{{ moduleItem.phase }}</span>
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';

defineProps<{
  activePath: string;
  isOpen: boolean;
  modules: AppModuleSummary[];
}>();

defineEmits<{
  navigate: [];
}>();
</script>
