<template>
  <div v-if="isOpen">
    <div class="modal fade show d-block pawn-contract-create-page__confirm-modal" tabindex="-1" role="dialog"
      aria-modal="true" @click.self="emit('close')">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable pawn-contract-create-page__warning-dialog">
        <div class="modal-content pawn-contract-create-page__confirm-content border-0">
          <div class="modal-header pawn-contract-create-page__confirm-header">
            <div class="d-flex align-items-start gap-3">
              <div class="pawn-contract-create-page__confirm-panel-icon is-warning">
                <i class="bi bi-exclamation-triangle-fill" aria-hidden="true" />
              </div>
              <div>
                <div class="pawn-contract-create-page__section-kicker">
                  Validasi
                </div>
                <h1 class="modal-title h5 mb-1">
                  {{ title }}
                </h1>
                <p class="text-muted mb-0">
                  Lengkapi atau perbaiki data berikut sebelum melanjutkan proses.
                </p>
              </div>
            </div>
            <button type="button" class="btn-close" aria-label="Close" @click="emit('close')" />
          </div>

          <div class="modal-body" data-testid="pawn-contract-validation-modal">
            <div class="pawn-contract-create-page__confirm-panel">
              <ul class="mb-0 pawn-contract-create-page__warning-list">
                <li v-for="(message, index) in messages" :key="`${index}-${message}`"
                  :data-testid="`pawn-contract-validation-message-${index}`">
                  <i class="bi bi-dot" aria-hidden="true" />
                  <span>{{ message }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="modal-footer pawn-contract-create-page__confirm-footer">
            <button type="button" class="btn btn-primary" @click="emit('close')">
              Saya cek lagi
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show pawn-contract-create-page__confirm-backdrop" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';

interface PawnContractFormValidationProps {
  isOpen: boolean;
  title: string;
  messages: string[];
}

const props = defineProps<PawnContractFormValidationProps>();
const emit = defineEmits<{
  close: [];
}>();

const isOpen = computed<boolean>(() => props.isOpen);
const title = computed<string>(() => props.title);
const messages = computed<ReadonlyArray<string>>(() => props.messages);

const syncBodyScrollLock = (value: boolean): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('modal-open', value);
};

watch(isOpen, (value: boolean) => {
  syncBodyScrollLock(value);
}, { immediate: true });

onBeforeUnmount(() => {
  syncBodyScrollLock(false);
});
</script>
