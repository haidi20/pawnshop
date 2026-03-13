<template>
  <div class="company-page container-fluid py-4">
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
                  Profil Perusahaan
                </li>
              </ol>
            </nav>
            <h1 class="h3 mb-0">
              Pengaturan Perusahaan
            </h1>
          </div>
        </header>

        <div
          v-if="!canEditCompany"
          class="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-3 p-4 mb-4"
        >
          <i class="bi bi-exclamation-triangle-fill fs-3" />
          <div>
            <h4 class="alert-heading h5 mb-1">
              Akses Terbatas
            </h4>
            <p class="mb-0 text-dark opacity-75">
              Hanya pengguna dengan peran <strong>Owner</strong> yang dapat mengubah informasi profil perusahaan.
            </p>
          </div>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-4 mb-4">
              <div
                class="bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center"
                style="width: 80px; height: 80px;"
              >
                <i class="bi bi-building fs-1" />
              </div>
              <div>
                <h2 class="h4 mb-1">
                  {{ currentSession?.company.name }}
                </h2>
                <p class="text-muted mb-0">
                  {{ currentSession?.company.businessType || 'Jenis usaha belum diatur' }}
                </p>
              </div>
            </div>

            <form @submit.prevent="handleCompanyUpdate">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label">Nama Bisnis</label>
                  <input
                    v-model.trim="companyForm.name"
                    type="text"
                    class="form-control"
                    placeholder="Nama perusahaan"
                    :disabled="!canEditCompany"
                    required
                  >
                </div>
                <div class="col-md-12">
                  <label class="form-label">Nama Legal (PT / CV / UD)</label>
                  <input
                    v-model.trim="companyForm.legalName"
                    type="text"
                    class="form-control"
                    placeholder="Nama resmi perusahaan"
                    :disabled="!canEditCompany"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Jenis Usaha</label>
                  <input
                    v-model.trim="companyForm.businessType"
                    type="text"
                    class="form-control"
                    placeholder="Contoh: Pegadaian, Ritel, dll"
                    :disabled="!canEditCompany"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Kota</label>
                  <input
                    v-model.trim="companyForm.city"
                    type="text"
                    class="form-control"
                    placeholder="Kota operasional"
                    :disabled="!canEditCompany"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email Kantor</label>
                  <input
                    v-model.trim="companyForm.email"
                    type="email"
                    class="form-control"
                    placeholder="Email resmi"
                    :disabled="!canEditCompany"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">No. Telepon Kantor</label>
                  <input
                    v-model.trim="companyForm.phoneNumber"
                    type="text"
                    class="form-control"
                    placeholder="Nomor telepon resmi"
                    :disabled="!canEditCompany"
                  >
                </div>
                <div class="col-12">
                  <label class="form-label">Alamat Lengkap Kantor</label>
                  <textarea
                    v-model.trim="companyForm.address"
                    class="form-control"
                    rows="3"
                    placeholder="Alamat kantor pusat"
                    :disabled="!canEditCompany"
                  />
                </div>
                <div
                  v-if="canEditCompany"
                  class="col-12 pt-2"
                >
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
                    <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Profil Perusahaan' }}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { companyViewModel } from '@core/presentation/view_models/company.vm';

const vm = companyViewModel();
const { currentSession, isSubmitting, canEditCompany, form: companyForm } = storeToRefs(vm);

const handleCompanyUpdate = async (): Promise<void> => {
  await vm.updateCompany();
};

onMounted(() => {
  vm.syncForm();
});
</script>
