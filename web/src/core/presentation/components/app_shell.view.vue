<template>
  <div
    class="admin-layout"
    :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }"
  >
    <AppSidebar
      :active-path="route.fullPath"
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

        <div
          v-if="currentSession"
          class="admin-header-user"
        >
          <div class="admin-header-user-summary">
            <span class="admin-header-user-company">{{ currentSession.company.name }}</span>
            <strong class="admin-header-user-name">{{ currentSession.user.fullName }}</strong>
          </div>

          <div
            ref="userMenuRef"
            class="admin-header-user-menu"
          >
            <button
              class="admin-header-user-button"
              type="button"
              title="Menu pengguna"
              aria-label="Menu pengguna"
              :aria-expanded="isUserMenuOpen"
              @click="toggleUserMenu"
            >
              <i class="bi bi-person" />
            </button>

            <div
              v-if="isUserMenuOpen"
              class="admin-header-user-dropdown"
              role="menu"
              aria-label="Menu pengguna"
            >
              <button
                class="admin-header-user-dropdown-item"
                type="button"
                role="menuitem"
                @click="navigateToProfile"
              >
                <i class="bi bi-person-vcard" />
                <span>Profil saya</span>
              </button>

              <button
                v-if="canEditCompany"
                class="admin-header-user-dropdown-item"
                type="button"
                role="menuitem"
                @click="navigateToCompany"
              >
                <i class="bi bi-building-gear" />
                <span>Data perusahaan</span>
              </button>

              <button
                v-if="canEditCompany"
                class="admin-header-user-dropdown-item"
                type="button"
                role="menuitem"
                @click="navigateToSettings"
              >
                <i class="bi bi-cpu" />
                <span>Pengaturan sistem</span>
              </button>

              <div class="admin-header-user-dropdown-divider" />

              <button
                class="admin-header-user-dropdown-item admin-header-user-dropdown-item--danger"
                type="button"
                role="menuitem"
                :disabled="isSubmitting"
                @click="handleLogout"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                />
                <i
                  v-else
                  class="bi bi-box-arrow-right"
                />
                <span>{{ isSubmitting ? 'Memproses...' : 'Logout' }}</span>
              </button>
            </div>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterView, useRoute, useRouter } from 'vue-router';

import { getAppNavigationItems } from '@core/data/datasources/app_module_catalog';
import AppSidebar from '@core/presentation/components/app_sidebar.view.vue';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';

const route = useRoute();
const router = useRouter();
const baseNavigationItems = getAppNavigationItems();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);
const mobileSidebarBreakpoint = 920;
const authVm = authPortalViewModel();
const { currentSession, isSubmitting } = storeToRefs(authVm);

const navigationItems = computed(() =>
  baseNavigationItems
    .filter((item) => item.key !== 'system' || currentSession.value?.user.role === 'owner')
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => child.key !== 'system-users' || currentSession.value?.user.role === 'owner'
      )
    }))
    .filter((item) => (item.children ? item.children.length > 0 || item.route : true))
);

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

const closeUserMenu = (): void => {
  isUserMenuOpen.value = false;
};

const toggleUserMenu = (): void => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const canEditCompany = computed<boolean>(() => currentSession.value?.user.role === 'owner');

const navigateToProfile = (): void => {
  closeUserMenu();
  router.push('/settings/profile');
};

const navigateToCompany = (): void => {
  closeUserMenu();
  router.push('/settings/company');
};

const navigateToSettings = (): void => {
  closeUserMenu();
  router.push('/settings/system');
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

const handleDocumentPointerDown = (event: MouseEvent): void => {
  if (!isUserMenuOpen.value || !userMenuRef.value) {
    return;
  }

  if (event.target instanceof Node && !userMenuRef.value.contains(event.target)) {
    closeUserMenu();
  }
};

const handleWindowKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape') {
    return;
  }

  closeUserMenu();
};

const handleLogout = async (): Promise<void> => {
  closeUserMenu();

  try {
    await authVm.logout();
    await router.replace('/login');
    await showSuccessMessage('Logout berhasil', 'Sesi Anda sudah ditutup.', {
      toast: true,
      timer: 1600,
      position: 'top-end',
    });
  } catch (error) {
    await showErrorMessage('Logout gagal', error instanceof Error ? error.message : String(error));
  }
};

watch(
  () => route.path,
  () => {
    closeSidebar();
    closeUserMenu();
  }
);

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('mousedown', handleDocumentPointerDown);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleWindowKeydown);
  }

  void authVm.hydrateSession();
});

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('mousedown', handleDocumentPointerDown);
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleWindowKeydown);
  }
});
</script>
