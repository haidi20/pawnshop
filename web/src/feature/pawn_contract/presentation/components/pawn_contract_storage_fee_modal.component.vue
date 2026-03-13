<template>
  <BaseModalComponent
    :is-open="row !== null"
    size="xl"
    @close="emit('close')"
  >
    <div class="modal-header pawn-contract-page__storage-fee-header">
      <div>
        <div class="pawn-contract-page__section-eyebrow mb-2">
          Pembayaran Biaya Titip
        </div>
        <h2 class="h5 mb-1">
          {{ row?.customerName }}
        </h2>
        <p class="mb-0 text-secondary text-sm">
          {{ row?.contract.contractNumber }} - {{ row?.itemNames }}
        </p>
      </div>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="emit('close')"
      />
    </div>

    <div class="modal-body pawn-contract-page__storage-fee-body">
      <div class="row g-4">
        <div class="col-lg-7">
          <section class="pawn-contract-page__storage-fee-section">
            <h3 class="h6 mb-3 text-uppercase fw-bold text-muted small">
              Rincian Tunggakan
            </h3>
            <div class="pawn-contract-page__arrears-card card border-0 bg-light shadow-none">
              <div class="card-body p-4">
                <div class="row align-items-center mb-4">
                  <div class="col">
                    <div class="pawn-contract-page__arrears-label text-secondary small mb-1">
                      Total Tunggakan
                    </div>
                    <div class="pawn-contract-page__arrears-value h3 mb-0 text-danger fw-bold">
                      {{ formatCurrency(row?.arrears.overdueAmount ?? 0) }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">
                      {{ row?.arrears.overduePeriods }} {{ row?.arrears.unitLabel }} Terlewati
                    </div>
                  </div>
                </div>

                <div class="pawn-contract-page__arrears-details border-top pt-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-secondary">Jatuh Tempo Hari Ini</span>
                    <span class="fw-medium">{{ formatCurrency(row?.arrears.dueTodayAmount ?? 0) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-secondary">Tanggal Jatuh Tempo</span>
                    <span class="fw-medium text-danger">{{ formatDate(row?.contract.maturityDate ?? null) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="pawn-contract-page__storage-fee-section mt-4">
            <h3 class="h6 mb-3 text-uppercase fw-bold text-muted small">
              Informasi Kontrak
            </h3>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="pawn-contract-page__info-item p-3 border rounded">
                  <div class="text-secondary small mb-1">
                    Nilai Pinjaman
                  </div>
                  <div class="fw-bold">
                    {{ formatCurrency(row?.contract.disbursedValue ?? 0) }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="pawn-contract-page__info-item p-3 border rounded">
                  <div class="text-secondary small mb-1">
                    Biaya Titip Per {{ row?.contract.paymentOptionDays }} Hari
                  </div>
                  <div class="fw-bold">
                    {{ formatCurrency(row?.contract.storageFeeAmount ?? 0) }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="col-lg-5">
          <div
            class="card border-0 shadow-sm sticky-top"
            style="top: 0"
          >
            <div class="card-body p-4">
              <h3 class="h6 mb-4 text-uppercase fw-bold text-muted small">
                Ringkasan Pembayaran
              </h3>
              <div class="mb-4">
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                  <span class="text-secondary">Biaya Titip Terutang</span>
                  <span class="fw-medium">{{ formatCurrency(row?.arrears.overdueAmount ?? 0) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                  <span class="text-secondary">Biaya Titip Hari Ini</span>
                  <span class="fw-medium">{{ formatCurrency(row?.arrears.dueTodayAmount ?? 0) }}</span>
                </div>
                <div class="d-flex justify-content-between h5 mb-0 pt-2 fw-bold text-primary">
                  <span>Total Bayar</span>
                  <span>{{ formatCurrency((row?.arrears.overdueAmount ?? 0) + (row?.arrears.dueTodayAmount ?? 0))
                  }}</span>
                </div>
              </div>

              <div class="alert alert-info border-0 bg-info-subtle small mb-4">
                <i class="bi bi-info-circle me-2" />
                Pembayaran biaya titip akan memperbarui tanggal jatuh tempo kontrak secara otomatis.
              </div>

              <button
                type="button"
                class="btn btn-primary w-100 py-3 fw-bold shadow-sm"
                @click="handleConfirm"
              >
                Proses Pembayaran
              </button>
              <button
                type="button"
                class="btn btn-link w-100 mt-2 text-decoration-none text-secondary"
                @click="emit('close')"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModalComponent>
</template>

<script setup lang="ts">
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';
import BaseModalComponent from '@core/presentation/components/base_modal.component.vue';

const props = defineProps<{
  row: PawnContractSummaryModel | null;
  formatCurrency: (value: number) => string;
  formatDate: (value: string | null) => string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [row: PawnContractSummaryModel];
}>();

const handleConfirm = (): void => {
  if (props.row) {
    emit('confirm', props.row);
  }
};
</script>

<style scoped>
.pawn-contract-page__storage-fee-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.pawn-contract-page__section-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bs-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pawn-contract-page__storage-fee-body {
  padding: 2rem;
  background-color: #f8f9fa;
}

.pawn-contract-page__storage-fee-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.pawn-contract-page__arrears-card {
  border-radius: 0.75rem;
}

.pawn-contract-page__info-item {
  background: #f8f9fa;
  border-color: #e9ecef !important;
}

.sticky-top {
  z-index: 10;
}
</style>
