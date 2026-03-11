<template>
  <section
    v-if="isLoading"
    class="card p-4"
  >
    <div class="d-flex align-items-center gap-3">
      <div
        class="spinner-border text-primary"
        role="status"
        aria-hidden="true"
      />
      <div>
        <div class="fw-bold">
          Memuat user perusahaan
        </div>
        <div class="text-secondary">
          Mengambil daftar user dan assignment cabang perusahaan aktif.
        </div>
      </div>
    </div>
  </section>

  <section
    v-else-if="error && !data"
    class="card p-4"
  >
    <div class="fw-bold text-danger mb-2">
      Gagal memuat user perusahaan
    </div>
    <p class="mb-3 text-secondary">
      {{ error }}
    </p>
    <button
      class="btn btn-primary"
      type="button"
      @click="vm.loadData()"
    >
      Muat ulang
    </button>
  </section>

  <section
    v-else-if="data"
    class="system-users-page"
  >
    <section class="card border-0 shadow-sm system-users-page__hero">
      <div class="card-body p-3">
        <div class="system-users-page__hero-head">
          <div class="system-users-page__hero-copy">
            <div class="system-users-page__eyebrow">
              Sistem
            </div>
            <h1 class="system-users-page__title">
              User Perusahaan
            </h1>
            <p class="system-users-page__subtitle mb-0">
              Owner melihat semua cabang. Setiap user pegawai hanya boleh terhubung ke satu cabang.
            </p>
          </div>

          <div class="system-users-page__hero-badge">
            <i class="bi bi-diagram-3" />
            <span>{{ data.companyName }}</span>
          </div>
        </div>

        <div class="system-users-page__stats">
          <article class="system-users-page__stat-card">
            <span>Total user</span>
            <strong>{{ totalUserCount }}</strong>
          </article>
          <article class="system-users-page__stat-card">
            <span>User pegawai</span>
            <strong>{{ employeeCount }}</strong>
          </article>
          <article class="system-users-page__stat-card">
            <span>Sudah ada cabang</span>
            <strong>{{ assignedEmployeeCount }}</strong>
          </article>
          <article class="system-users-page__stat-card">
            <span>Cabang aktif</span>
            <strong>{{ branchOptions.length }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section
      v-if="error"
      class="system-users-page__inline-error"
    >
      <i class="bi bi-exclamation-circle" />
      <span>{{ error }}</span>
    </section>

    <section
      v-if="branchOptions.length === 0"
      class="card border-0 shadow-sm"
    >
      <div class="card-body p-3">
        <div class="system-users-page__empty-state">
          <strong>Belum ada cabang aktif.</strong>
          <span>Assignment cabang user akan tersedia setelah data cabang perusahaan dibuat.</span>
        </div>
      </div>
    </section>

    <section class="system-users-page__list">
      <article
        v-for="user in userItems"
        :key="user.id"
        class="card border-0 shadow-sm system-users-page__user-card"
      >
        <div class="card-body p-3">
          <div class="system-users-page__user-head">
            <div>
              <div class="system-users-page__user-role">
                {{ getRoleLabel(user.role) }}
              </div>
              <h2 class="system-users-page__user-name">
                {{ user.fullName }}
              </h2>
              <p class="system-users-page__user-identity mb-0">
                @{{ user.username }}
              </p>
            </div>

            <span
              class="system-users-page__user-status"
              :class="{ 'is-active': user.isActive }"
            >
              {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>

          <div class="system-users-page__user-meta">
            <span>{{ formatValue(user.email) }}</span>
            <span>{{ formatValue(user.phoneNumber) }}</span>
          </div>

          <div
            v-if="user.role === 'owner'"
            class="system-users-page__owner-access"
          >
            <i class="bi bi-stars" />
            <span>Owner selalu memiliki akses ke semua cabang.</span>
          </div>

          <div
            v-else
            class="system-users-page__assignment"
          >
            <div class="system-users-page__assignment-copy">
              <label :for="`system-user-branch-${user.id}`">Cabang akses</label>
              <p class="mb-0">
                Pilih satu cabang untuk user ini. Jika belum diatur, user tidak akan melihat data cabang.
              </p>
            </div>

            <div class="system-users-page__assignment-controls">
              <select
                :id="`system-user-branch-${user.id}`"
                v-model="branchDrafts[user.id]"
                class="form-select"
                :disabled="branchOptions.length === 0 || vm.isSavingUser(user.id)"
              >
                <option value="">
                  Belum diatur
                </option>
                <option
                  v-for="branch in branchOptions"
                  :key="branch.id"
                  :value="String(branch.id)"
                >
                  {{ branch.branchName }}
                </option>
              </select>

              <button
                class="btn btn-primary"
                type="button"
                :disabled="!canSaveUser(user.id) || vm.isSavingUser(user.id)"
                @click="saveBranch(user.id)"
              >
                <span
                  v-if="vm.isSavingUser(user.id)"
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                />
                <i
                  v-else
                  class="bi bi-check2-circle"
                />
                <span>{{ vm.isSavingUser(user.id) ? 'Menyimpan...' : 'Simpan cabang' }}</span>
              </button>
            </div>

            <div class="system-users-page__assignment-note">
              <strong>Akses saat ini:</strong>
              <span>{{ user.assignedBranchName ?? 'Belum diatur' }}</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { showSuccessMessage } from '@core/util/alert';
import type { AuthPortalUserRoleModel } from '@feature/auth_portal/domain/models';
import '@feature/auth_portal/presentation/styles/auth_portal_users.scss';
import { authPortalUsersViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal_users.vm';

const vm = authPortalUsersViewModel();
const {
  data,
  error,
  isLoading,
  branchOptions,
  userItems,
  totalUserCount,
  employeeCount,
  assignedEmployeeCount
} = storeToRefs(vm);

const branchDrafts = reactive<Record<number, string>>({});

const getRoleLabel = (role: AuthPortalUserRoleModel): string => {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    default:
      return 'Staff';
  }
};

const formatValue = (value: string | null): string => {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '-';
};

const syncBranchDrafts = (): void => {
  userItems.value.forEach((user) => {
    branchDrafts[user.id] = user.assignedBranchId !== null ? String(user.assignedBranchId) : '';
  });
};

const canSaveUser = (userId: number): boolean => {
  const user = userItems.value.find((item) => item.id === userId);
  if (!user || user.role === 'owner') {
    return false;
  }

  const nextBranchId = branchDrafts[userId] || '';
  const currentBranchId = user.assignedBranchId !== null ? String(user.assignedBranchId) : '';
  return nextBranchId !== currentBranchId;
};

const saveBranch = async (userId: number): Promise<void> => {
  try {
    await vm.updateUserBranchAssignment({
      userId,
      branchId: branchDrafts[userId] ? Number(branchDrafts[userId]) : null
    });

    await showSuccessMessage('Cabang user diperbarui', 'Assignment cabang user sudah disimpan.', {
      toast: true,
      timer: 1600,
      position: 'top-end'
    });
  } catch {
    // Error state dirender inline dari store.
  }
};

watch(userItems, () => {
  syncBranchDrafts();
}, { immediate: true, deep: true });

onMounted(() => {
  void vm.loadData();
});
</script>
