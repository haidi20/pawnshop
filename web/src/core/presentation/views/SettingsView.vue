<template>
  <div class="settings-page container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-8">
        <header class="mb-4">
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
                Pengaturan Sistem
              </li>
            </ol>
          </nav>
          <h1 class="h3 mb-0">
            Pengaturan & Alat Sistem
          </h1>
        </header>

        <section class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4">
            <h2 class="h5 mb-0">
              Manajemen Data (Seeder)
            </h2>
          </div>
          <div class="card-body p-4">
            <p class="text-muted mb-4">
              Gunakan alat ini untuk mengisi data simulasi dengan cepat ke dalam sistem lokal Anda.
            </p>

            <div class="row g-4">
              <div class="col-md-6">
                <div class="p-4 border rounded-3 h-100 d-flex flex-column">
                  <div class="mb-3 text-primary">
                    <i class="bi bi-database-fill-add fs-1" />
                  </div>
                  <h3 class="h5 mb-2">
                    Default Seeder
                  </h3>
                  <p class="small text-muted flex-grow-1">
                    Mengisi data master dasar seperti cabang, kategori barang, dan beberapa transaksi contoh untuk
                    eksplorasi fitur.
                  </p>
                  <button
                    type="button"
                    class="btn btn-outline-primary mt-3 d-flex align-items-center justify-content-center gap-2"
                    :disabled="isProcessing"
                    @click="vm.runDefaultSeeder()"
                  >
                    <span
                      v-if="isProcessing"
                      class="spinner-border spinner-border-sm"
                    />
                    <span>Jalankan Default Seeder</span>
                  </button>
                </div>
              </div>

              <div class="col-md-6">
                <div class="p-4 border rounded-3 h-100 d-flex flex-column">
                  <div class="mb-3 text-success">
                    <i class="bi bi-file-earmark-plus-fill fs-1" />
                  </div>
                  <h3 class="h5 mb-2">
                    1 Data Per Perusahaan
                  </h3>
                  <p class="small text-muted flex-grow-1">
                    Menambahkan tepat satu kontrak gadai aktif dengan status <strong>Belum Lunas</strong> untuk setiap
                    perusahaan yang tersedia.
                  </p>
                  <button
                    type="button"
                    class="btn btn-outline-success mt-3 d-flex align-items-center justify-content-center gap-2"
                    :disabled="isProcessing"
                    @click="vm.runSingleActiveSeeder()"
                  >
                    <span
                      v-if="isProcessing"
                      class="spinner-border spinner-border-sm"
                    />
                    <span>Jalankan Seeder Aktif</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { settingsViewModel } from '@core/presentation/view_models/settings.vm';

const vm = settingsViewModel();
const { isProcessing } = storeToRefs(vm);
</script>

<style scoped>
.breadcrumb-item+.breadcrumb-item::before {
  content: "›";
  font-size: 1.2rem;
  line-height: 1;
}
</style>
