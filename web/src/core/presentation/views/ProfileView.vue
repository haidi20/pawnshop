<template>
  <div class="profile-page container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-8">
        <header class="mb-4 d-flex align-items-center justify-content-between">
          <div>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-1">
                <li class="breadcrumb-item">
                  <RouterLink to="/dashboard">
                    Dashboard
                  </RouterLink>
                </li>
                <li
                  class="breadcrumb-item active"
                  aria-current="page"
                >
                  Profil Pengguna
                </li>
              </ol>
            </nav>
            <h1 class="h3 mb-0">
              Pengaturan Profil
            </h1>
          </div>
        </header>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-4 mb-4">
              <div
                class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style="width: 80px; height: 80px;"
              >
                <i class="bi bi-person-circle fs-1" />
              </div>
              <div>
                <h2 class="h4 mb-1">
                  {{ currentSession?.user.fullName }}
                </h2>
                <p class="text-muted mb-0">
                  @{{ currentSession?.user.username }} &bull; {{ currentUserRoleLabel }}
                </p>
              </div>
            </div>

            <form @submit.prevent="handleProfileUpdate">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nama Lengkap</label>
                  <input
                    v-model.trim="profileForm.fullName"
                    type="text"
                    class="form-control"
                    placeholder="Nama lengkap"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Username</label>
                  <input
                    v-model.trim="profileForm.username"
                    type="text"
                    class="form-control"
                    placeholder="Username"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input
                    v-model.trim="profileForm.email"
                    type="email"
                    class="form-control"
                    placeholder="Alamat email"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">No. Telepon</label>
                  <input
                    v-model.trim="profileForm.phoneNumber"
                    type="text"
                    class="form-control"
                    placeholder="Nomor telepon"
                  >
                </div>
                <div class="col-12 pt-2">
                  <button
                    type="submit"
                    class="btn btn-primary d-inline-flex align-items-center gap-2"
                    :disabled="isSubmitting"
                  >
                    <span
                      v-if="isSubmitting"
                      class="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    <i
                      v-else
                      class="bi bi-check2-circle"
                    />
                    <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent border-0 pt-4 px-4">
            <h3 class="h5 mb-0">
              Informasi Tambahan
            </h3>
          </div>
          <div class="card-body p-4">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small">Cabang Aktif</span>
                  <span class="fw-semibold">{{ currentUserBranchAccessLabel }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small">Perusahaan</span>
                  <span class="fw-semibold">{{ currentSession?.company.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { profileViewModel } from '@core/presentation/view_models/profile.vm';

const vm = profileViewModel();
const { currentSession, isSubmitting, form: profileForm } = storeToRefs(vm);

const handleProfileUpdate = async (): Promise<void> => {
  await vm.updateProfile();
};

const currentUserRoleLabel = computed<string>(() => {
  const role = currentSession.value?.user.role ?? '';
  if (!role) return '-';
  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    admin: 'Admin',
    staff: 'Staff',
  };
  return roleLabels[role.toLowerCase()] ?? role;
});

const currentUserBranchAccessLabel = computed<string>(() => {
  const session = currentSession.value;
  if (!session) return '-';
  if (session.user.role === 'owner') return 'Semua Cabang';
  return session.user.assignedBranchName ?? 'Belum diatur';
});

onMounted(() => {
  vm.syncForm();
});
</script>
