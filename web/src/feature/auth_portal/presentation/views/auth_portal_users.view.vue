<template>
  <LocalDbFeedbackStateComponent
    v-if="isLoading"
    state="loading"
    title="Memuat user perusahaan"
    description="Mengambil daftar user dan assignment cabang perusahaan aktif dari database lokal."
    note="Owner akan melihat seluruh user yang tersimpan pada scope perusahaan aktif."
  />

  <LocalDbFeedbackStateComponent
    v-else-if="error && !data"
    state="error"
    title="Gagal memuat user perusahaan"
    :description="error"
    note="Coba muat ulang agar daftar user dan cabang dibaca ulang dari DB lokal."
    action-label="Muat ulang"
    @action="vm.loadData()"
  />

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
        <LocalDbFeedbackStateComponent
          state="empty"
          title="Belum ada cabang aktif"
          description="Assignment cabang user baru tersedia setelah data cabang perusahaan dibuat di database lokal."
          note="Tanpa cabang aktif, user karyawan tidak akan melihat data operasional cabangnya."
          :framed="false"
          compact
        />
      </div>
    </section>

    <section class="card border-0 shadow-sm system-users-page__table-card">
      <div class="card-body p-3">
        <div class="system-users-page__table-head">
          <div>
            <div class="system-users-page__eyebrow mb-1">
              Daftar User
            </div>
            <h2 class="system-users-page__table-title">
              Assignment akses cabang user
            </h2>
            <p class="system-users-page__table-subtitle mb-0">
              Data tabel ini dimuat dari DB lokal perusahaan aktif melalui VM, usecase, repository, local datasource, dan DAO.
            </p>
          </div>
        </div>

        <DataTableClientSideComponent
          :vm="dataTableVm"
          class="mt-3 system-users-page__datatable"
        >
          <template #body="{ item }">
            <tr>
              <td data-label="Role">
                <span
                  class="system-users-page__role-badge"
                  :class="`is-${item.source.role}`"
                >
                  {{ item.roleLabel }}
                </span>
              </td>
              <td data-label="Nama User">
                <div class="system-users-page__user-cell">
                  <strong>{{ item.source.fullName }}</strong>
                </div>
              </td>
              <td data-label="Username">
                <span class="system-users-page__muted-text">{{ item.usernameLabel }}</span>
              </td>
              <td data-label="Email">
                {{ item.emailLabel }}
              </td>
              <td data-label="No. HP">
                {{ item.phoneNumberLabel }}
              </td>
              <td data-label="Status">
                <span
                  class="system-users-page__status-badge"
                  :class="{ 'is-active': item.source.isActive }"
                >
                  {{ item.statusLabel }}
                </span>
              </td>
              <td data-label="Cabang Akses">
                <div
                  v-if="item.source.role === 'owner'"
                  class="system-users-page__owner-access"
                >
                  <i class="bi bi-stars" />
                  <span>Owner selalu melihat semua cabang.</span>
                </div>
                <div
                  v-else
                  class="system-users-page__assignment-cell"
                >
                  <select
                    :id="`system-user-branch-${item.source.id}`"
                    v-model="branchDrafts[item.source.id]"
                    class="form-select"
                    :disabled="branchOptions.length === 0 || vm.isSavingUser(item.source.id)"
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
                  <div class="system-users-page__assignment-note">
                    <strong>Akses saat ini:</strong>
                    <span>{{ item.source.assignedBranchName ?? 'Belum diatur' }}</span>
                  </div>
                </div>
              </td>
              <td data-label="Aksi">
                <button
                  v-if="item.source.role !== 'owner'"
                  class="btn btn-primary system-users-page__save-button"
                  type="button"
                  :disabled="!vm.canSaveUser(item.source.id) || vm.isSavingUser(item.source.id)"
                  @click="saveBranch(item.source.id)"
                >
                  <span
                    v-if="vm.isSavingUser(item.source.id)"
                    class="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  />
                  <i
                    v-else
                    class="bi bi-check2-circle"
                  />
                  <span>{{ vm.isSavingUser(item.source.id) ? 'Menyimpan...' : 'Simpan cabang' }}</span>
                </button>
                <span
                  v-else
                  class="system-users-page__action-placeholder"
                >
                  Semua cabang
                </span>
              </td>
            </tr>
          </template>
          <template #empty>
            <LocalDbFeedbackStateComponent
              state="empty"
              title="Belum ada user perusahaan"
              description="Data user akan tampil otomatis setelah dimuat dari database lokal perusahaan aktif."
              note="Owner dapat membuat akun baru melalui proses registrasi atau sinkronisasi data lokal."
              :framed="false"
              compact
            />
          </template>
        </DataTableClientSideComponent>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import { showSuccessMessage } from '@core/util/alert';
import '@feature/auth_portal/presentation/styles/auth_portal_users.scss';
import { authPortalUsersViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal_users.vm';

const vm = authPortalUsersViewModel();
const {
  data,
  error,
  isLoading,
  branchOptions,
  branchDrafts,
  totalUserCount,
  employeeCount,
  assignedEmployeeCount
} = storeToRefs(vm);
const dataTableVm = vm.dataTableVm;

const saveBranch = async (userId: number): Promise<void> => {
  try {
    await vm.saveBranchAssignment(userId);

    await showSuccessMessage('Cabang user diperbarui', 'Assignment cabang user sudah disimpan.', {
      toast: true,
      timer: 1600,
      position: 'top-end'
    });
  } catch {
    // Error state dirender inline dari store.
  }
};

onMounted(() => {
  void vm.loadData();
});
</script>
