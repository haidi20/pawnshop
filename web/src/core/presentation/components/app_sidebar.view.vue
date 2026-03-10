<template>
  <aside
    class="admin-sidebar"
    :class="{ 'is-open': isOpen }"
    data-testid="app-sidebar"
  >
    <div class="sidebar-brand">
      <div class="brand-mark">
        PS
      </div>
      <div>
        <div class="brand-title">
          Pegadaian
        </div>
        <div class="brand-subtitle">
          Sistem Informasi Pegadaian
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in items"
        :key="item.key"
        :to="item.route"
        class="sidebar-link"
        :class="{ active: activePath === item.route || activePath.startsWith(`${item.route}/`) }"
        :data-testid="`sidebar-link-${item.key}`"
        @click="$emit('navigate')"
      >
        <span class="sidebar-link-icon">
          <i
            class="bi"
            :class="item.icon"
          />
        </span>
        <span class="sidebar-link-content">
          <span class="sidebar-link-title">{{ item.label }}</span>
          <span class="sidebar-link-subtitle">{{ item.caption }}</span>
        </span>
      </RouterLink>
    </nav>

    <hr>

    <section
      class="sidebar-danger"
      data-testid="sidebar-danger-zone"
    >
      <div class="sidebar-danger-badge">
        Danger Zone
      </div>
      <button
        class="sidebar-danger-button"
        type="button"
        :disabled="isResetting"
        data-testid="sidebar-danger-reset"
        @click="resetLocalData"
      >
        <i
          class="bi"
          :class="isResetting ? 'bi-arrow-repeat' : 'bi-trash3'"
        />
        <span>{{ isResetting ? 'Menghapus data...' : 'Hapus data' }}</span>
      </button>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

import type { AppNavigationItem } from '@core/domain/interfaces/app_module.interface';

const localDbPrefix = 'pawnshop.localdb.';

defineProps<{
  activePath: string;
  isOpen: boolean;
  items: AppNavigationItem[];
}>();

defineEmits<{
  navigate: [];
}>();

const isResetting = ref(false);

const resetLocalData = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const confirmed = window.confirm('Hapus seluruh data lokal dan reload aplikasi?');
  if (!confirmed) {
    return;
  }

  isResetting.value = true;

  if (typeof localStorage !== 'undefined') {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(localDbPrefix))
      .forEach((key) => {
        localStorage.removeItem(key);
      });
  }

  window.location.reload();
};
</script>
