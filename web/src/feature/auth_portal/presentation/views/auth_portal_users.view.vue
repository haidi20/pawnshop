<template>
  <LocalDbFeedbackStateComponent
    v-if="isLoading"
    state="loading"
    title="Memuat pengguna"
    description="Mengambil daftar user dan assignment cabang perusahaan aktif dari database lokal."
    note="Owner akan melihat seluruh user yang tersimpan pada scope perusahaan aktif."
  />

  <LocalDbFeedbackStateComponent
    v-else-if="error && !data"
    state="error"
    title="Gagal memuat pengguna"
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
              Pengguna
            </h1>
            <p class="system-users-page__subtitle mb-0">
              atur pengguna untuk mengakses aplikasi dan delegasi cabang pada karyawan anda
            </p>
          </div>

          <div class="system-users-page__hero-context">
            <div class="system-users-page__hero-badge">
              <i class="bi bi-diagram-3" />
              <span>{{ data.companyName }}</span>
            </div>
            <button
              type="button"
              class="system-users-page__hero-badge is-soft is-actionable"
              aria-label="Buka menu cabang"
              @click="openMasterBranchPage"
            >
              <i class="bi bi-shop" />
              <span>{{ branchOptions.length }} cabang tersedia</span>
            </button>
          </div>
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
          title="Belum ada cabang"
          description="Assignment cabang user baru tersedia setelah data cabang perusahaan dibuat di database lokal."
          note="Setelah cabang dibuat, owner bisa mendelegasikan cabang pertama ke user karyawan."
          :framed="false"
          compact
        />
      </div>
    </section>

    <section class="card border-0 shadow-sm system-users-page__table-card">
      <div class="card-body p-3">
        <DataTableClientSideComponent
          :vm="dataTableVm"
          class="mt-3 system-users-page__datatable"
        >
          <template #extra-actions>
            <div class="system-users-page__table-insights">
              <span class="system-users-page__insight-chip">
                {{ filteredUserCount }} user tampil
              </span>
              <span class="system-users-page__insight-chip is-info">
                dari {{ totalUserCount }} total pengguna
              </span>
            </div>
          </template>
          <template #body="{ item }">
            <tr
              :class="{
                'is-needs-attention': item.needsAttention
              }"
            >
              <td data-label="Aksi">
                <div
                  v-if="item.source.role !== 'owner'"
                  class="system-users-page__action-cell"
                >
                  <button
                    class="btn btn-outline-primary system-users-page__action-button"
                    type="button"
                    :aria-label="`Aksi untuk ${item.source.fullName}`"
                    :data-testid="`open-action-modal-${item.source.id}`"
                    @click="vm.openActionModal(item.source.id)"
                  >
                    <span>Aksi</span>
                  </button>
                </div>
                <span
                  v-else
                  class="system-users-page__action-placeholder"
                >
                  Semua cabang
                </span>
              </td>
              <td data-label="Role">
                <span
                  class="system-users-page__role-badge"
                  :class="`is-${item.source.role}`"
                >
                  {{ item.roleLabel }}
                </span>
              </td>
              <td data-label="User">
                <div
                  class="system-users-page__user-cell"
                  :data-testid="`system-user-row-${item.source.id}`"
                >
                  <div class="system-users-page__user-main">
                    <strong>{{ item.source.fullName }}</strong>
                    <span class="system-users-page__muted-text">{{ item.usernameLabel }}</span>
                  </div>
                  <div class="system-users-page__user-meta">
                    <span>
                      <i class="bi bi-envelope" />
                      {{ item.emailLabel }}
                    </span>
                    <span>
                      <i class="bi bi-telephone" />
                      {{ item.phoneNumberLabel }}
                    </span>
                  </div>
                </div>
              </td>
              <td data-label="Status">
                <div class="system-users-page__status-cell">
                  <span
                    class="system-users-page__status-badge"
                    :class="{ 'is-active': item.source.isActive }"
                  >
                    {{ item.statusLabel }}
                  </span>
                  <span class="system-users-page__status-note">
                    {{ getUserStatusNote(item.source.isActive) }}
                  </span>
                </div>
              </td>
              <td data-label="Cabang Akses">
                <div
                  v-if="item.source.role === 'owner'"
                  class="system-users-page__owner-access"
                >
                  <i class="bi bi-stars" />
                  <div class="system-users-page__owner-access-copy">
                    <strong>Owner otomatis melihat semua cabang</strong>
                    <span>Tidak perlu assignment manual untuk role ini.</span>
                  </div>
                </div>
                <div
                  v-else
                  class="system-users-page__assignment-display"
                  :class="`is-${item.assignmentTone}`"
                >
                  <div
                    class="system-users-page__assignment-note"
                    :class="`is-${item.assignmentTone}`"
                  >
                    <div class="system-users-page__assignment-note-head">
                      <strong>{{ item.assignmentStatusLabel }}</strong>
                      <span>{{ item.assignmentHelpText }}</span>
                    </div>
                    <div class="system-users-page__assignment-meta">
                      <span>
                        <small>Cabang delegasi</small>
                        <strong>{{ item.currentBranchLabel }}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <template #empty>
            <LocalDbFeedbackStateComponent
              state="empty"
              title="Belum ada pengguna"
              description="Data user akan tampil otomatis setelah dimuat dari database lokal perusahaan aktif."
              note="Owner dapat membuat akun baru melalui proses registrasi atau sinkronisasi data."
              :framed="false"
              compact
            />
          </template>
        </DataTableClientSideComponent>
      </div>
    </section>

    <AuthPortalUserActionModalComponent
      :user="activeActionModalUser"
      @close="vm.closeActionModal()"
      @edit-branch="vm.openBranchModalFromAction()"
    />

    <AuthPortalUserBranchModalComponent
      :user="activeBranchModalUser"
      :state="activeBranchModalState"
      :branch-options="branchOptions"
      :draft-value="activeBranchModalUser ? branchDrafts[activeBranchModalUser.id] ?? '' : ''"
      :can-save="activeBranchModalUser ? vm.canSaveUser(activeBranchModalUser.id) : false"
      :saving="activeBranchModalUser ? vm.isSavingUser(activeBranchModalUser.id) : false"
      @update:draft-value="updateActiveBranchDraft"
      @cancel="vm.cancelBranchModal()"
      @save="saveBranchFromModal"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import { showSuccessMessage } from '@core/util/alert';
import AuthPortalUserActionModalComponent from '@feature/auth_portal/presentation/components/auth_portal_user_action_modal.component.vue';
import AuthPortalUserBranchModalComponent from '@feature/auth_portal/presentation/components/auth_portal_user_branch_modal.component.vue';
import '@feature/auth_portal/presentation/styles/auth_portal_users.scss';
import { authPortalUsersViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal_users.vm';

const vm = authPortalUsersViewModel();
const {
  data,
  error,
  isLoading,
  branchOptions,
  activeBranchCount,
  branchDrafts,
  totalUserCount,
  unassignedEmployeeCount,
  filteredUserCount,
  searchKeyword,
  activeActionModalUser,
  activeBranchModalUser,
  activeBranchModalState
} = storeToRefs(vm);
const dataTableVm = vm.dataTableVm;
const router = useRouter();

const getUserStatusNote = (isActive: boolean): string =>
  isActive
    ? 'Bisa login dan memakai akses tersimpan.'
    : 'Tidak bisa login sampai diaktifkan lagi.';

const openMasterBranchPage = (): void => {
  void router.push({ name: 'MasterBranch' });
};

const updateActiveBranchDraft = (value: string): void => {
  if (!activeBranchModalUser.value) {
    return;
  }

  branchDrafts.value[activeBranchModalUser.value.id] = value;
};

const saveBranchFromModal = async (): Promise<void> => {
  if (!activeBranchModalUser.value) {
    return;
  }

  try {
    await vm.saveBranchFromModal();

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
