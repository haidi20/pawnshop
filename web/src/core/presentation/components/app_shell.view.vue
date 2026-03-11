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
                @click="openProfileDialog"
              >
                <i class="bi bi-person-vcard" />
                <span>Profile</span>
              </button>

              <button
                class="admin-header-user-dropdown-item"
                type="button"
                role="menuitem"
              >
                <i class="bi bi-sliders" />
                <span>Pengaturan</span>
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

  <div
    v-if="currentSession && isProfileDialogOpen"
    class="admin-profile-backdrop"
    @click.self="closeProfileDialog"
  >
    <section
      class="admin-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-profile-title"
    >
      <div class="admin-profile-modal-head">
        <div class="admin-profile-title-wrap">
          <div class="admin-profile-avatar">
            <i class="bi bi-person-circle" />
          </div>

          <div class="admin-profile-title-copy">
            <span class="admin-profile-kicker">Profile</span>
            <h2
              id="admin-profile-title"
              class="admin-profile-title"
            >
              {{ currentSession.user.fullName }}
            </h2>
            <p class="admin-profile-subtitle">
              {{ currentSession.company.name }}
            </p>
          </div>
        </div>

        <button
          class="admin-profile-close"
          type="button"
          aria-label="Tutup profile"
          @click="closeProfileDialog"
        >
          <i class="bi bi-x-lg" />
        </button>
      </div>

      <div class="admin-profile-grid">
        <section class="admin-profile-section">
          <h3 class="admin-profile-section-title">
            Informasi Pengguna
          </h3>

          <dl class="admin-profile-list">
            <div class="admin-profile-row">
              <dt>Nama</dt>
              <dd>{{ currentSession.user.fullName }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Role</dt>
              <dd>{{ currentUserRoleLabel }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Username</dt>
              <dd>@{{ currentSession.user.username }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Email</dt>
              <dd>{{ formatProfileValue(currentSession.user.email) }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>No. HP</dt>
              <dd>{{ formatProfileValue(currentSession.user.phoneNumber) }}</dd>
            </div>
          </dl>
        </section>

        <section class="admin-profile-section">
          <h3 class="admin-profile-section-title">
            Informasi Perusahaan
          </h3>

          <dl class="admin-profile-list">
            <div class="admin-profile-row">
              <dt>Perusahaan</dt>
              <dd>{{ currentSession.company.name }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Legal Name</dt>
              <dd>{{ formatProfileValue(currentSession.company.legalName) }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Jenis Usaha</dt>
              <dd>{{ formatProfileValue(currentSession.company.businessType) }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Kota</dt>
              <dd>{{ formatProfileValue(currentSession.company.city) }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>Email</dt>
              <dd>{{ formatProfileValue(currentSession.company.email) }}</dd>
            </div>
            <div class="admin-profile-row">
              <dt>No. Telepon</dt>
              <dd>{{ formatProfileValue(currentSession.company.phoneNumber) }}</dd>
            </div>
            <div class="admin-profile-row admin-profile-row--stacked">
              <dt>Alamat</dt>
              <dd>{{ formatProfileValue(currentSession.company.address) }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
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
const navigationItems = getAppNavigationItems();
const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const isUserMenuOpen = ref(false);
const isProfileDialogOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);
const mobileSidebarBreakpoint = 920;
const authVm = authPortalViewModel();
const { currentSession, isSubmitting } = storeToRefs(authVm);

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

const openProfileDialog = (): void => {
  isProfileDialogOpen.value = true;
  closeUserMenu();
};

const closeProfileDialog = (): void => {
  isProfileDialogOpen.value = false;
};

const formatProfileValue = (value: string | null | undefined): string => {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '-';
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

const currentUserRoleLabel = computed<string>(() => {
  const role = currentSession.value?.user.role ?? '';

  if (!role) {
    return '-';
  }

  const normalizedRole = role.toLowerCase();
  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    admin: 'Admin',
    staff: 'Staff',
  };

  return roleLabels[normalizedRole] ?? `${normalizedRole.charAt(0).toUpperCase()}${normalizedRole.slice(1)}`;
});

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
  closeProfileDialog();
};

const handleLogout = async (): Promise<void> => {
  closeUserMenu();
  closeProfileDialog();

  try {
    await authVm.logout();
    await showSuccessMessage('Logout berhasil', 'Sesi Anda sudah ditutup.', {
      toast: true,
      timer: 1600,
      position: 'top-end',
    });
    await router.replace('/login');
  } catch (error) {
    await showErrorMessage('Logout gagal', error instanceof Error ? error.message : String(error));
  }
};

watch(
  () => route.path,
  () => {
    closeSidebar();
    closeUserMenu();
    closeProfileDialog();
  }
);

watch(isProfileDialogOpen, (value) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('modal-open', value);
});

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
    document.body.classList.remove('modal-open');
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleWindowKeydown);
  }
});
</script>
