<template>
  <aside
    class="admin-sidebar"
    :class="{ 'is-open': isOpen, 'is-collapsed': isCollapsed }"
    data-testid="app-sidebar"
  >
    <div class="sidebar-brand">
      <div class="sidebar-brand-main">
        <div class="brand-mark">
          PS
        </div>
        <div class="sidebar-brand-copy">
          <div class="brand-title">
            Pegadaian
          </div>
          <div class="brand-subtitle">
            Sistem Informasi Pegadaian
          </div>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <template
        v-for="item in items"
        :key="item.key"
      >
        <RouterLink
          v-if="!item.children?.length && item.route"
          :to="item.route"
          class="sidebar-link"
          :class="{ active: isItemActive(item.route) }"
          :data-testid="`sidebar-link-${item.key}`"
          :title="item.label"
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

        <section
          v-else
          class="sidebar-group"
          :class="{ 'is-active': isGroupExpanded(item) }"
          :data-testid="`sidebar-group-${item.key}`"
        >
          <button
            class="sidebar-group-head sidebar-group-toggle"
            type="button"
            :title="item.label"
            :aria-expanded="isGroupExpanded(item)"
            @click="toggleGroup(item)"
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
            <span
              class="sidebar-group-chevron"
              aria-hidden="true"
            >
              <i
                class="bi"
                :class="isGroupExpanded(item) ? 'bi-chevron-up' : 'bi-chevron-down'"
              />
            </span>
          </button>

          <div
            v-if="isGroupExpanded(item)"
            class="sidebar-subnav"
          >
            <RouterLink
              v-for="child in item.children"
              :key="child.key"
              :to="child.route ?? '/dashboard'"
              class="sidebar-sublink"
              :class="{ active: isItemActive(child.route) }"
              :data-testid="`sidebar-link-${child.key}`"
              :title="child.label"
              @click="$emit('navigate')"
            >
              <span class="sidebar-sublink-bullet" />
              <span class="sidebar-sublink-icon">
                <i
                  class="bi"
                  :class="child.icon"
                />
              </span>
              <span class="sidebar-sublink-text">{{ child.label }}</span>
            </RouterLink>
          </div>
        </section>
      </template>
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
        title="Hapus data lokal"
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
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import type { AppNavigationItem } from '@core/domain/interfaces/app_module.interface';

const localDbPrefix = 'pawnshop.localdb.';

const props = defineProps<{
  activePath: string;
  isOpen: boolean;
  isCollapsed: boolean;
  items: AppNavigationItem[];
}>();

defineEmits<{
  navigate: [];
}>();

const isResetting = ref(false);
const expandedGroupKey = ref<string | null>(null);
const activePath = computed<string>(() => props.activePath);
const isCollapsed = computed<boolean>(() => props.isCollapsed);

const isItemActive = (route?: string): boolean =>
  route !== undefined && (activePath.value === route || activePath.value.startsWith(`${route}/`));

const isGroupActive = (item: AppNavigationItem): boolean =>
  item.children?.some((child) => isItemActive(child.route)) ?? false;

const isGroupExpanded = (item: AppNavigationItem): boolean => isGroupActive(item) || expandedGroupKey.value === item.key;

const toggleGroup = (item: AppNavigationItem): void => {
  if (isCollapsed.value || !item.children?.length) {
    return;
  }

  expandedGroupKey.value = expandedGroupKey.value === item.key ? null : item.key;
};

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
