<template>
  <LocalDbFeedbackStateComponent v-if="isLoading && !data" state="loading" title="Memuat master cabang"
    description="Mengambil data cabang dari database lokal perusahaan aktif."
    note="Tabel cabang akan siap dipakai setelah pembacaan data lokal selesai." />

  <LocalDbFeedbackStateComponent v-else-if="error && !data" state="error" title="Gagal memuat master cabang"
    :description="error" note="Coba muat ulang agar data cabang dari DB lokal dibaca kembali." action-label="Muat ulang"
    @action="vm.getMasterBranchData()" />

  <section v-else class="feature-data-page master-data-page">
    <section class="master-data-page__hero">
      <div class="master-data-page__hero-head">
        <div>
          <div class="table-card-role">
            Master Cabang
          </div>
          <h1 class="table-card-title master-data-page__title">
            Cabang operasional
          </h1>
          <p class="table-card-description mb-0">
            Kelola cabang aktif perusahaan untuk operasional dan assignment user.
          </p>
        </div>

        <button type="button" class="btn btn-success master-data-page__hero-action" @click="vm.openCreateBranchModal()">
          <i class="bi bi-plus-circle" />
          <span>Tambah cabang</span>
        </button>
      </div>

      <div class="master-data-page__stats-grid">
        <article class="metric-card master-data-page__metric-card">
          <div class="metric-label">
            Total Cabang
          </div>
          <div class="metric-value">
            {{ totalBranchCount }}
          </div>
          <div class="metric-note">
            Seluruh cabang yang tersimpan untuk perusahaan aktif.
          </div>
        </article>

        <article class="metric-card master-data-page__metric-card">
          <div class="metric-label">
            Cabang Aktif
          </div>
          <div class="metric-value">
            {{ activeBranchCount }}
          </div>
          <div class="metric-note">
            Cabang yang siap dipakai pada operasional harian.
          </div>
        </article>

        <article class="metric-card master-data-page__metric-card">
          <div class="metric-label">
            Belum Aktif
          </div>
          <div class="metric-value">
            {{ inactiveBranchCount }}
          </div>
          <div class="metric-note">
            Cabang yang masih tersimpan tetapi belum diaktifkan.
          </div>
        </article>
      </div>
    </section>

    <section v-if="error" class="master-data-page__inline-error">
      <i class="bi bi-exclamation-circle" />
      <span>{{ error }}</span>
    </section>

    <article class="feature-data-page__table-section master-data-page__table-section">
      <div class="feature-data-page__table-head master-data-page__table-head">
        <div class="master-data-page__table-copy">
          <div class="table-card-role">
            Data Cabang
          </div>
          <h2 class="table-card-title mb-1">
            Daftar cabang
          </h2>
          <p class="table-card-description mb-0">
            Gunakan tombol aksi untuk mengubah detail atau menghapus cabang yang sudah tidak dipakai.
          </p>
        </div>

        <div class="feature-data-page__table-meta master-data-page__table-meta">
          <span class="status-badge is-ready">{{ branchRowCount }} baris</span>
        </div>
      </div>

      <DataTableClientSideComponent :vm="branchTableVm" class="master-data-page__datatable">
        <template #extra-actions>
          <div class="master-data-page__table-tools">
            <span class="master-data-page__filter-chip">
              {{ activeBranchCount }} aktif
            </span>
            <span v-if="inactiveBranchCount > 0" class="master-data-page__filter-chip is-warning">
              {{ inactiveBranchCount }} belum aktif
            </span>
          </div>
        </template>

        <template #body="{ item }">
          <tr>
            <td data-label="Aksi" class="master-data-page__col-action">
              <div class="master-data-page__action-cell">
                <button type="button" class="btn btn-outline-primary btn-sm" @click="vm.openBranchActionModal(item)">
                  Aksi
                </button>
              </div>
            </td>
            <td data-label="Kode Cabang">
              <strong>{{ item.branchCode }}</strong>
            </td>
            <td data-label="Nomor Cabang">
              {{ item.branchNumberLabel }}
            </td>
            <td data-label="Nama Cabang">
              <div class="master-data-page__identity-cell">
                <strong>{{ item.branchName }}</strong>
                <span>{{ item.addressLabel }}</span>
              </div>
            </td>
            <td data-label="Nomor Telepon">
              {{ item.phoneNumberLabel }}
            </td>
            <td data-label="Status Aktif">
              <span class="master-data-page__status-badge" :class="`is-${item.statusTone}`">
                {{ item.statusLabel }}
              </span>
            </td>
          </tr>
        </template>

        <template #empty>
          <LocalDbFeedbackStateComponent state="empty" title="Belum ada cabang"
            description="Tambahkan cabang pertama agar assignment user dan operasional cabang bisa dimulai."
            note="Data tersimpan langsung ke database lokal perusahaan aktif." :framed="false" compact>
            <template #actions>
              <button type="button" class="btn btn-success" @click="vm.openCreateBranchModal()">
                Tambah cabang
              </button>
            </template>
          </LocalDbFeedbackStateComponent>
        </template>
      </DataTableClientSideComponent>

      <p v-if="branchSearchKeyword" class="master-data-page__search-feedback mb-0">
        Menampilkan {{ branchRowCount }} hasil untuk "{{ branchSearchKeyword }}".
      </p>
    </article>
  </section>

  <template v-if="isBranchDialogOpen">
    <section class="modal fade show d-block master-data-page__modal" tabindex="-1" role="dialog" aria-modal="true"
      aria-labelledby="master-branch-modal-title" @click.self="closeBranchModal">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable master-data-page__modal-dialog">
        <div class="modal-content border-0 master-data-page__modal-content">
          <div class="modal-header master-data-page__modal-header">
            <div>
              <div class="table-card-role mb-2">
                Master Cabang
              </div>
              <h2 id="master-branch-modal-title" class="h5 mb-1">
                {{ branchDialogTitle }}
              </h2>
              <p class="mb-0 text-secondary">
                Lengkapi identitas cabang yang akan dipakai pada operasional perusahaan.
              </p>
            </div>
            <button type="button" class="btn-close" aria-label="Tutup" :disabled="isSavingBranch"
              @click="closeBranchModal" />
          </div>

          <div class="modal-body master-data-page__modal-body">
            <div class="master-data-page__form-grid">
              <label class="master-data-page__field">
                <span>Kode cabang</span>
                <input v-model.trim="branchForm.branchCode" type="text" class="form-control"
                  placeholder="Contoh: BR-SMD-001">
              </label>

              <label class="master-data-page__field">
                <span>Nomor cabang</span>
                <input v-model.trim="branchForm.branchNumber" type="text" class="form-control"
                  placeholder="Contoh: 001">
              </label>

              <label class="master-data-page__field master-data-page__field--full">
                <span>Nama cabang</span>
                <input v-model.trim="branchForm.branchName" type="text" class="form-control"
                  placeholder="Nama cabang operasional">
              </label>

              <label class="master-data-page__field">
                <span>Nomor telepon</span>
                <input v-model.trim="branchForm.phoneNumber" type="text" class="form-control"
                  placeholder="No. telepon cabang">
              </label>

              <label class="master-data-page__field">
                <span>Status</span>
                <select v-model="branchForm.isActive" class="form-select">
                  <option :value="true">
                    Aktif
                  </option>
                  <option :value="false">
                    Belum aktif
                  </option>
                </select>
              </label>

              <label class="master-data-page__field master-data-page__field--full">
                <span>Alamat</span>
                <textarea v-model.trim="branchForm.address" class="form-control" rows="3" placeholder="Alamat cabang" />
              </label>
            </div>
          </div>

          <div class="modal-footer master-data-page__modal-footer">
            <button type="button" class="btn btn-outline-secondary" :disabled="isSavingBranch"
              @click="closeBranchModal">
              Batal
            </button>
            <button type="button" class="btn btn-primary" :disabled="isSavingBranch" @click="handleSaveBranch">
              <span v-if="isSavingBranch" class="spinner-border spinner-border-sm" aria-hidden="true" />
              <i v-else class="bi bi-check2-circle" />
              <span>{{ isSavingBranch ? 'Menyimpan...' : 'Simpan cabang' }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
    <div class="modal-backdrop fade show master-data-page__modal-backdrop" @click="closeBranchModal" />
  </template>

  <template v-if="vm.branchActionModal.isOpen && vm.branchActionModal.item">
    <section class="modal fade show d-block master-data-page__modal" tabindex="-1" role="dialog" aria-modal="true"
      @click.self="vm.closeBranchActionModal()">
      <div class="modal-dialog modal-dialog-centered modal-sm master-data-page__modal-dialog--sm">
        <div class="modal-content border-0 master-data-page__modal-content">
          <div class="modal-header master-data-page__modal-header">
            <div>
              <div class="table-card-role mb-2">
                Aksi Cabang
              </div>
              <h2 class="h5 mb-1">
                {{ vm.branchActionModal.item.branchName }}
              </h2>
              <p class="mb-0 text-secondary" style="font-size: 0.85rem;">
                Pilih tindakan yang ingin dilakukan untuk cabang ini.
              </p>
            </div>
            <button type="button" class="btn-close" aria-label="Tutup" @click="vm.closeBranchActionModal()" />
          </div>
          <div class="modal-body master-data-page__modal-body">
            <div class="d-grid gap-2">
              <button type="button" class="btn btn-outline-primary w-100 text-sm-start"
                @click="vm.openEditBranchModal(vm.branchActionModal.item.source.id); vm.closeBranchActionModal()">
                <i class="bi bi-pencil-square me-2" />
                <span>Ubah</span>
              </button>
              <button type="button" class="btn btn-outline-danger w-100 text-sm-start"
                :disabled="vm.isDeletingBranch(vm.branchActionModal.item.source.id)"
                @click="confirmDeleteBranch(vm.branchActionModal.item); vm.closeBranchActionModal()">
                <i class="bi bi-trash me-2" />
                <span>{{ vm.isDeletingBranch(vm.branchActionModal.item.source.id) ? 'Menghapus...' : 'Hapus'
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="modal-backdrop fade show master-data-page__modal-backdrop" @click="vm.closeBranchActionModal()" />
  </template>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import '@core/presentation/styles/feature_data_tables.css';
import '@feature/master_branch/presentation/styles/master_branch.css';
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@core/util/alert';
import { masterBranchViewModel, type MasterBranchTableRow } from '@feature/master_branch/presentation/view_models/master_branch.vm';

const vm = masterBranchViewModel();
const {
  data,
  error,
  isLoading,
  branchForm,
  branchDialogTitle,
  isBranchDialogOpen,
  isSavingBranch,
  totalBranchCount,
  activeBranchCount,
  inactiveBranchCount,
  branchRowCount,
  branchSearchKeyword,
  branchActionModal
} = storeToRefs(vm);
const branchTableVm = vm.branchTableVm;

const closeBranchModal = (): void => {
  if (isSavingBranch.value) {
    return;
  }

  vm.closeBranchModal();
};

const handleSaveBranch = async (): Promise<void> => {
  const isEditMode = vm.branchDialogMode === 'edit';

  try {
    await vm.saveBranch();
    await showSuccessMessage(
      isEditMode ? 'Cabang diperbarui' : 'Cabang ditambahkan',
      isEditMode ? 'Perubahan data cabang sudah disimpan.' : 'Cabang baru sudah ditambahkan.',
      {
        toast: true,
        timer: 1600,
        position: 'top-end'
      }
    );
  } catch (currentError) {
    await showErrorMessage(
      'Simpan cabang gagal',
      currentError instanceof Error ? currentError.message : String(currentError)
    );
  }
};

const confirmDeleteBranch = async (item: MasterBranchTableRow): Promise<void> => {
  const result = await showWarningMessage(
    'Hapus cabang?',
    `Cabang "${item.branchName}" akan dihapus dari database lokal.`,
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
    await vm.deleteBranch(item.source.id);
    await showSuccessMessage('Cabang dihapus', 'Data cabang sudah dihapus.', {
      toast: true,
      timer: 1600,
      position: 'top-end'
    });
  } catch (currentError) {
    await showErrorMessage(
      'Hapus cabang gagal',
      currentError instanceof Error ? currentError.message : String(currentError)
    );
  }
};

watch(isBranchDialogOpen, (value) => {
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
