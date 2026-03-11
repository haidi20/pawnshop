<template>
  <LocalDbFeedbackStateComponent
    v-if="isLoading && !data"
    state="loading"
    title="Memuat lokasi penyimpanan"
    description="Mengambil data lokasi penyimpanan dari database lokal perusahaan aktif."
    note="Tabel lokasi akan siap dipakai setelah pembacaan data lokal selesai."
  />

  <LocalDbFeedbackStateComponent
    v-else-if="error && !data"
    state="error"
    title="Gagal memuat lokasi penyimpanan"
    :description="error"
    note="Coba muat ulang agar data lokasi dari DB lokal dibaca kembali."
    action-label="Muat ulang"
    @action="vm.getMasterBranchData()"
  />

  <section
    v-else
    class="feature-data-page master-data-page"
  >
    <section class="master-data-page__hero">
      <div class="master-data-page__hero-head">
        <div>
          <div class="table-card-role">
            Lokasi Penyimpanan
          </div>
          <h1 class="table-card-title master-data-page__title">
            Lokasi per cabang
          </h1>
          <p class="table-card-description mb-0">
            Kelola titik penyimpanan barang untuk masing-masing cabang.
          </p>
        </div>

        <button
          type="button"
          class="btn btn-primary master-data-page__hero-action"
          @click="vm.openCreateLocationModal()"
        >
          <i class="bi bi-plus-circle" />
          <span>Tambah lokasi</span>
        </button>
      </div>

      <div class="master-data-page__stats-grid">
        <article class="metric-card master-data-page__metric-card">
          <div class="metric-label">
            Total Lokasi
          </div>
          <div class="metric-value">
            {{ totalLocationCount }}
          </div>
          <div class="metric-note">
            Seluruh lokasi penyimpanan yang tersimpan pada perusahaan aktif.
          </div>
        </article>

        <article class="metric-card master-data-page__metric-card">
          <div class="metric-label">
            Lokasi Aktif
          </div>
          <div class="metric-value">
            {{ activeLocationCount }}
          </div>
          <div class="metric-note">
            Lokasi yang siap dipakai untuk alur penyimpanan barang.
          </div>
        </article>

        <article class="metric-card master-data-page__metric-card">
          <div class="metric-label">
            Cabang Terhubung
          </div>
          <div class="metric-value">
            {{ linkedBranchCount }}
          </div>
          <div class="metric-note">
            Cabang yang sudah memiliki minimal satu lokasi tersimpan.
          </div>
        </article>
      </div>
    </section>

    <section
      v-if="error"
      class="master-data-page__inline-error"
    >
      <i class="bi bi-exclamation-circle" />
      <span>{{ error }}</span>
    </section>

    <article class="feature-data-page__table-section master-data-page__table-section">
      <div class="feature-data-page__table-head master-data-page__table-head">
        <div class="master-data-page__table-copy">
          <div class="table-card-role">
            Data Lokasi
          </div>
          <h2 class="table-card-title mb-1">
            Daftar lokasi penyimpanan
          </h2>
          <p class="table-card-description mb-0">
            Gunakan tombol aksi untuk memperbarui detail lokasi atau menghapus lokasi yang sudah tidak dipakai.
          </p>
        </div>

        <div class="feature-data-page__table-meta master-data-page__table-meta">
          <span class="status-badge is-ready">{{ locationRowCount }} baris</span>
        </div>
      </div>

      <DataTableClientSideComponent
        :vm="locationTableVm"
        class="master-data-page__datatable"
      >
        <template #extra-actions>
          <div class="master-data-page__table-tools">
            <span class="master-data-page__filter-chip">
              {{ activeLocationCount }} aktif
            </span>
            <span class="master-data-page__filter-chip is-info">
              {{ linkedBranchCount }} cabang terhubung
            </span>
            <button
              type="button"
              class="btn btn-outline-primary master-data-page__table-action"
              @click="vm.openCreateLocationModal()"
            >
              <i class="bi bi-plus-circle" />
              <span>Tambah lokasi</span>
            </button>
          </div>
        </template>

        <template #body="{ item }">
          <tr>
            <td data-label="Aksi">
              <div class="master-data-page__action-cell">
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="vm.openEditLocationModal(item.source.id)"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="vm.isDeletingLocation(item.source.id)"
                  @click="confirmDeleteLocation(item)"
                >
                  {{ vm.isDeletingLocation(item.source.id) ? 'Menghapus...' : 'Hapus' }}
                </button>
              </div>
            </td>
            <td data-label="Cabang">
              <div class="master-data-page__identity-cell">
                <strong>{{ item.branchLabel }}</strong>
                <span>{{ item.branchCodeLabel }}</span>
              </div>
            </td>
            <td data-label="Kode Lokasi">
              <strong>{{ item.locationCode }}</strong>
            </td>
            <td data-label="Nama Lokasi">
              {{ item.locationName }}
            </td>
            <td data-label="Tipe Lokasi">
              {{ item.locationType }}
            </td>
            <td data-label="Status Aktif">
              <span
                class="master-data-page__status-badge"
                :class="`is-${item.statusTone}`"
              >
                {{ item.statusLabel }}
              </span>
            </td>
          </tr>
        </template>

        <template #empty>
          <LocalDbFeedbackStateComponent
            state="empty"
            title="Belum ada lokasi penyimpanan"
            description="Tambahkan lokasi pertama agar penyimpanan barang per cabang bisa dikelola."
            note="Pilih cabang yang sesuai lalu simpan lokasi ke database lokal perusahaan aktif."
            :framed="false"
            compact
          >
            <template #actions>
              <button
                type="button"
                class="btn btn-primary"
                @click="vm.openCreateLocationModal()"
              >
                Tambah lokasi
              </button>
            </template>
          </LocalDbFeedbackStateComponent>
        </template>
      </DataTableClientSideComponent>

      <p
        v-if="locationSearchKeyword"
        class="master-data-page__search-feedback mb-0"
      >
        Menampilkan {{ locationRowCount }} hasil untuk "{{ locationSearchKeyword }}".
      </p>
    </article>
  </section>

  <template v-if="isLocationDialogOpen">
    <section
      class="modal fade show d-block master-data-page__modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="master-location-modal-title"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable master-data-page__modal-dialog">
        <div class="modal-content border-0 master-data-page__modal-content">
          <div class="modal-header master-data-page__modal-header">
            <div>
              <div class="table-card-role mb-2">
                Lokasi Penyimpanan
              </div>
              <h2
                id="master-location-modal-title"
                class="h5 mb-1"
              >
                {{ locationDialogTitle }}
              </h2>
              <p class="mb-0 text-secondary">
                Hubungkan lokasi ini ke cabang yang sesuai dan tentukan status aktifnya.
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Tutup"
              :disabled="isSavingLocation"
              @click="closeLocationModal"
            />
          </div>

          <div class="modal-body master-data-page__modal-body">
            <div class="master-data-page__form-grid">
              <label class="master-data-page__field master-data-page__field--full">
                <span>Cabang</span>
                <select
                  v-model="locationForm.branchId"
                  class="form-select"
                >
                  <option value="">
                    Pilih cabang
                  </option>
                  <option
                    v-for="branch in branchOptions"
                    :key="branch.id"
                    :value="branch.id"
                  >
                    {{ branch.label }}
                  </option>
                </select>
              </label>

              <label class="master-data-page__field">
                <span>Kode lokasi</span>
                <input
                  v-model.trim="locationForm.locationCode"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: OFF-MKS"
                >
              </label>

              <label class="master-data-page__field">
                <span>Tipe lokasi</span>
                <input
                  v-model.trim="locationForm.locationType"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Kantor, Gudang"
                >
              </label>

              <label class="master-data-page__field master-data-page__field--full">
                <span>Nama lokasi</span>
                <input
                  v-model.trim="locationForm.locationName"
                  type="text"
                  class="form-control"
                  placeholder="Nama lokasi penyimpanan"
                >
              </label>

              <label class="master-data-page__field">
                <span>Status</span>
                <select
                  v-model="locationForm.isActive"
                  class="form-select"
                >
                  <option :value="true">
                    Aktif
                  </option>
                  <option :value="false">
                    Belum aktif
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div class="modal-footer master-data-page__modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="isSavingLocation"
              @click="closeLocationModal"
            >
              Batal
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="isSavingLocation"
              @click="handleSaveLocation"
            >
              <span
                v-if="isSavingLocation"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              />
              <i
                v-else
                class="bi bi-check2-circle"
              />
              <span>{{ isSavingLocation ? 'Menyimpan...' : 'Simpan lokasi' }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
    <div
      class="modal-backdrop fade show master-data-page__modal-backdrop"
      @click="closeLocationModal"
    />
  </template>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import '@core/presentation/styles/feature_data_tables.css';
import '@feature/master_branch/presentation/styles/master_branch.css';
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@core/util/alert';
import { masterBranchViewModel, type MasterLocationTableRow } from '@feature/master_branch/presentation/view_models/master_branch.vm';

const vm = masterBranchViewModel();
const {
  data,
  error,
  isLoading,
  locationForm,
  locationDialogTitle,
  isLocationDialogOpen,
  isSavingLocation,
  branchOptions,
  totalLocationCount,
  activeLocationCount,
  linkedBranchCount,
  locationRowCount,
  locationSearchKeyword
} = storeToRefs(vm);
const locationTableVm = vm.locationTableVm;

const closeLocationModal = (): void => {
  if (isSavingLocation.value) {
    return;
  }

  vm.closeLocationModal();
};

const handleSaveLocation = async (): Promise<void> => {
  const isEditMode = vm.locationDialogMode === 'edit';

  try {
    await vm.saveLocation();
    await showSuccessMessage(
      isEditMode ? 'Lokasi diperbarui' : 'Lokasi ditambahkan',
      isEditMode ? 'Perubahan data lokasi sudah disimpan.' : 'Lokasi baru sudah ditambahkan.',
      {
        toast: true,
        timer: 1600,
        position: 'top-end'
      }
    );
  } catch (currentError) {
    await showErrorMessage(
      'Simpan lokasi gagal',
      currentError instanceof Error ? currentError.message : String(currentError)
    );
  }
};

const confirmDeleteLocation = async (item: MasterLocationTableRow): Promise<void> => {
  const result = await showWarningMessage(
    'Hapus lokasi?',
    `Lokasi "${item.locationName}" akan dihapus dari database lokal.`,
    {
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    }
  );

  if (!result.isConfirmed) {
    return;
  }

  try {
    await vm.deleteLocation(item.source.id);
    await showSuccessMessage('Lokasi dihapus', 'Data lokasi sudah dihapus.', {
      toast: true,
      timer: 1600,
      position: 'top-end'
    });
  } catch (currentError) {
    await showErrorMessage(
      'Hapus lokasi gagal',
      currentError instanceof Error ? currentError.message : String(currentError)
    );
  }
};

watch(isLocationDialogOpen, (value) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('modal-open', value);
});

onMounted(() => {
  vm.closeAllDialogs();
  void vm.getMasterBranchData();
});

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('modal-open');
  }
});
</script>
