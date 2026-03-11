<template>
  <template v-if="user && state">
    <section
      class="modal fade show d-block system-users-page__branch-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-user-branch-modal-title"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable system-users-page__branch-modal-dialog">
        <div class="modal-content border-0 system-users-page__branch-modal-content">
          <div class="modal-header system-users-page__branch-modal-header">
            <div>
              <div class="system-users-page__eyebrow mb-2">
                Ubah Cabang
              </div>
              <h2
                id="system-user-branch-modal-title"
                class="h5 mb-1"
              >
                {{ user.fullName }}
              </h2>
              <p class="mb-0 text-secondary">
                {{ user.role === 'admin' ? 'Admin' : 'Staff' }} - @{{ user.username }}
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Tutup"
              :disabled="saving"
              @click="handleCancel"
            />
          </div>

          <div class="modal-body system-users-page__branch-modal-body">
            <div class="system-users-page__branch-modal-summary">
              <span class="system-users-page__branch-modal-summary-label">Cabang tersimpan</span>
              <strong>{{ state.currentBranchLabel }}</strong>
            </div>

            <div
              class="system-users-page__assignment-note"
              :class="`is-${state.tone}`"
            >
              <div class="system-users-page__assignment-note-head">
                <strong>{{ state.statusLabel }}</strong>
                <span>{{ state.helpText }}</span>
              </div>
              <div class="system-users-page__assignment-meta">
                <span>
                  <small>Tersimpan</small>
                  <strong>{{ state.currentBranchLabel }}</strong>
                </span>
                <span>
                  <small>Pilihan saat ini</small>
                  <strong>{{ state.draftBranchLabel }}</strong>
                </span>
              </div>
            </div>

            <div class="system-users-page__branch-modal-field">
              <label
                class="system-users-page__assignment-label"
                :for="`system-user-branch-modal-select-${user.id}`"
              >
                Pilih cabang operasional
              </label>
              <select
                :id="`system-user-branch-modal-select-${user.id}`"
                class="form-select"
                :disabled="saving"
                :value="draftValue"
                :aria-describedby="`system-user-branch-modal-help-${user.id}`"
                :data-testid="`branch-modal-select-${user.id}`"
                @change="onDraftChange"
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
              <p
                :id="`system-user-branch-modal-help-${user.id}`"
                class="system-users-page__branch-modal-help mb-0"
              >
                Pilihan ini menentukan cabang operasional yang bisa diakses user saat login.
              </p>
            </div>
          </div>

          <div class="modal-footer system-users-page__branch-modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="saving"
              @click="handleCancel"
            >
              Batal
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!canSave || saving"
              :data-testid="`branch-modal-save-${user.id}`"
              @click="emit('save')"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              />
              <i
                v-else
                class="bi bi-check2-circle"
              />
              <span>{{ saving ? 'Menyimpan...' : 'Simpan perubahan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
    <div
      class="modal-backdrop fade show system-users-page__branch-modal-backdrop"
      @click="handleCancel"
    />
  </template>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';

import type { AuthPortalCompanyBranchOptionModel, AuthPortalCompanyUserItemModel } from '@feature/auth_portal/domain/models';
import type { AuthPortalBranchModalState } from '@feature/auth_portal/presentation/view_models/auth_portal_users.vm';

const props = defineProps<{
  user: AuthPortalCompanyUserItemModel | null;
  state: AuthPortalBranchModalState | null;
  branchOptions: AuthPortalCompanyBranchOptionModel[];
  draftValue: string;
  canSave: boolean;
  saving: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [];
  'update:draftValue': [value: string];
}>();

const onDraftChange = (event: Event): void => {
  emit('update:draftValue', (event.target as HTMLSelectElement).value);
};

const handleCancel = (): void => {
  if (props.saving) {
    return;
  }

  emit('cancel');
};

watch(
  () => props.user,
  (value) => {
    document.body.classList.toggle('modal-open', value !== null);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.body.classList.remove('modal-open');
});
</script>
