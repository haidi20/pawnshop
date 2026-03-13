<template>
  <div v-if="isOpen">
    <div class="modal fade show d-block pawn-contract-create-page__confirm-modal" tabindex="-1" role="dialog"
      aria-modal="true" @click.self="handleClose">
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl pawn-contract-create-page__confirm-dialog">
        <div class="modal-content pawn-contract-create-page__confirm-content border-0">
          <div class="modal-header pawn-contract-create-page__confirm-header">
            <div>
              <div class="pawn-contract-create-page__section-kicker">
                Konfirmasi
              </div>
              <h1 class="modal-title h5 mb-1">
                {{ isEditMode ? 'Simpan perubahan data gadai' : 'Simpan data gadai' }}
              </h1>
              <p class="text-muted mb-0">
                Periksa kembali seluruh data tab 1 dan tab 2 sebelum data disimpan ke penyimpanan lokal.
              </p>
            </div>
            <button type="button" class="btn-close" aria-label="Close" :disabled="isSubmitting" @click="handleClose" />
          </div>

          <div class="modal-body" data-testid="pawn-contract-submit-confirmation">
            <div class="pawn-contract-create-page__confirm-layout text-start">
              <section v-for="section in sections" :key="section.id" class="pawn-contract-create-page__confirm-panel"
                :data-testid="`pawn-contract-submit-section-${section.id}`">
                <div class="pawn-contract-create-page__confirm-panel-head">
                  <div class="pawn-contract-create-page__confirm-panel-icon">
                    <i :class="section.iconClass" aria-hidden="true" />
                  </div>
                  <div class="pawn-contract-create-page__confirm-panel-copy">
                    <div class="pawn-contract-create-page__section-kicker">
                      {{ section.kicker }}
                    </div>
                    <h2 class="pawn-contract-create-page__sidebar-title">
                      {{ section.title }}
                    </h2>
                    <p class="text-muted mb-0">
                      {{ section.description }}
                    </p>
                  </div>
                </div>

                <div class="pawn-contract-create-page__summary-list mt-4">
                  <div v-for="row in section.rows" :key="row.key" class="pawn-contract-create-page__summary-item"
                    :data-testid="`pawn-contract-submit-row-${section.id}-${row.key}`">
                    <div class="pawn-contract-create-page__summary-item-copy">
                      <span>{{ row.label }}</span>
                      <small v-if="row.helper" class="pawn-contract-create-page__summary-item-helper">{{ row.helper
                        }}</small>
                    </div>
                    <strong :class="row.valueClassName">{{ row.value }}</strong>
                  </div>
                </div>
              </section>

              <section class="pawn-contract-create-page__confirm-panel"
                data-testid="pawn-contract-submit-section-status">
                <div class="pawn-contract-create-page__confirm-panel-head">
                  <div class="pawn-contract-create-page__confirm-panel-icon is-status">
                    <i class="bi bi-shield-check" aria-hidden="true" />
                  </div>
                  <div class="pawn-contract-create-page__confirm-panel-copy">
                    <div class="pawn-contract-create-page__section-kicker">
                      Status pengecekan
                    </div>
                    <h2 class="pawn-contract-create-page__sidebar-title">
                      Validasi akhir sebelum simpan
                    </h2>
                    <p class="text-muted mb-0">
                      Sistem menampilkan kondisi dana dan pengecekan utama agar petugas bisa memutuskan dengan cepat.
                    </p>
                  </div>
                </div>

                <div class="pawn-contract-create-page__status-card mt-4">
                  <div class="pawn-contract-create-page__status-head">
                    <strong>Status transaksi</strong>
                    <span :class="hasEnoughBalance ? 'text-primary' : 'text-danger'">
                      {{ statusLabel }}
                    </span>
                  </div>
                  <ul class="mb-0 pawn-contract-create-page__status-checklist">
                    <li>
                      <i class="bi bi-check2-circle" aria-hidden="true" />
                      Dana pencairan tidak boleh lebih besar dari nilai taksiran.
                    </li>
                    <li>
                      <i class="bi bi-check2-circle" aria-hidden="true" />
                      Saldo kas cabang dicek ulang sebelum data disimpan.
                    </li>
                    <li>
                      <i class="bi bi-check2-circle" aria-hidden="true" />
                      Data nasabah lama akan dipakai otomatis jika cocok.
                    </li>
                  </ul>
                </div>

                <div class="pawn-contract-create-page__confirm-balance mt-4"
                  :class="hasEnoughBalance ? 'is-safe' : 'is-danger'" data-testid="pawn-contract-submit-balance">
                  <div class="d-flex align-items-start gap-3">
                    <i :class="hasEnoughBalance ? 'bi bi-wallet2' : 'bi bi-exclamation-triangle-fill'"
                      aria-hidden="true" />
                    <div>
                      <strong class="d-block mb-1">
                        {{ hasEnoughBalance ? 'Saldo cabang aman untuk diproses' : 'Saldo cabang perlu disesuaikan' }}
                      </strong>
                      <span>{{ balanceMessage }}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div class="modal-footer pawn-contract-create-page__confirm-footer">
            <button type="button" class="btn btn-outline-secondary" :disabled="isSubmitting" @click="handleClose">
              Periksa lagi
            </button>
            <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="emit('confirm')">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              {{ confirmButtonLabel }}
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
import type { PawnContractConfirmationSectionModel } from '@feature/pawn_contract/presentation/models/pawn_contract_confirmation.model';

interface PawnContractFormSubmitConfirmationProps {
  isOpen: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  sections: PawnContractConfirmationSectionModel[];
  statusLabel: string;
  balanceMessage: string;
  hasEnoughBalance: boolean;
}

const props = defineProps<PawnContractFormSubmitConfirmationProps>();
const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const isOpen = computed<boolean>(() => props.isOpen);
const isEditMode = computed<boolean>(() => props.isEditMode);
const isSubmitting = computed<boolean>(() => props.isSubmitting);
const sections = computed<ReadonlyArray<PawnContractConfirmationSectionModel>>(() => props.sections);
const statusLabel = computed<string>(() => props.statusLabel);
const balanceMessage = computed<string>(() => props.balanceMessage);
const hasEnoughBalance = computed<boolean>(() => props.hasEnoughBalance);
const confirmButtonLabel = computed<string>(() =>
  isEditMode.value ? 'Ya, simpan perubahan' : 'Ya, proses gadai'
);

const syncBodyScrollLock = (value: boolean): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('modal-open', value);
};

const handleClose = (): void => {
  if (isSubmitting.value) {
    return;
  }

  emit('close');
};

watch(isOpen, (value: boolean) => {
  syncBodyScrollLock(value);
}, { immediate: true });

onBeforeUnmount(() => {
  syncBodyScrollLock(false);
});
</script>
