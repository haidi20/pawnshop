<template>
  <template v-if="user">
    <section
      class="modal fade show d-block system-users-page__action-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-user-action-modal-title"
      @click.self="emit('close')"
    >
      <div class="modal-dialog modal-dialog-centered system-users-page__action-modal-dialog">
        <div class="modal-content border-0 system-users-page__action-modal-content">
          <div class="modal-header system-users-page__action-modal-header">
            <div>
              <div class="system-users-page__eyebrow mb-2">
                Aksi User
              </div>
              <h2
                id="system-user-action-modal-title"
                class="h6 mb-1"
              >
                {{ user.fullName }}
              </h2>
              <p class="mb-0 text-secondary">
                Pilih aksi yang ingin dijalankan untuk user ini.
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Tutup"
              @click="emit('close')"
            />
          </div>

          <div class="modal-body system-users-page__action-modal-body">
            <button
              type="button"
              class="btn btn-outline-primary system-users-page__action-modal-button"
              :data-testid="`action-modal-branch-${user.id}`"
              @click="emit('edit-branch')"
            >
              <i class="bi bi-pencil-square" />
              <span>Ubah cabang</span>
            </button>
          </div>
        </div>
      </div>
    </section>
    <div
      class="modal-backdrop fade show system-users-page__action-modal-backdrop"
      @click="emit('close')"
    />
  </template>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';

import type { AuthPortalCompanyUserItemModel } from '@feature/auth_portal/domain/models';

const props = defineProps<{
  user: AuthPortalCompanyUserItemModel | null;
}>();

const emit = defineEmits<{
  close: [];
  'edit-branch': [];
}>();

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
