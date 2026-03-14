<template>
  <BaseModalComponent :is-open="row !== null" size="xl" @close="handleClose">
    <div class="modal-header pawn-contract-page__storage-fee-header">
      <div>
        <div class="pawn-contract-page__section-eyebrow mb-2">
          Pembayaran Biaya Titip
        </div>
        <h2 class="h5 mb-1">
          {{ row?.customerName }}
        </h2>
        <div class="text-secondary text-sm mt-2">
          <div class="mb-2">{{ row?.contract.contractNumber }} - {{ row?.itemNames }}</div>
          <div class="d-flex align-items-center flex-wrap gap-2">
            <span v-if="row?.contract.disbursedValue && row?.contract.appraisedValue"
              class="badge bg-success-subtle text-success-emphasis border border-success-subtle fw-semibold">
              <i class="bi bi-cash-stack me-1"></i> Pinjaman: {{ formatCurrency(row.contract.appraisedValue) }} | {{
                formatCurrency(row.contract.disbursedValue) }}
            </span>
            <span v-if="row?.contract.termDays"
              class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold">
              <i class="bi bi-clock me-1"></i> Durasi: {{ row.contract.termDays }} Hari
            </span>
            <span v-if="row?.contract.storageFeeAmount"
              class="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-semibold">
              <i class="bi bi-receipt me-1"></i> Skema: {{ formatCurrency(row.contract.storageFeeAmount) }} / {{
                row.contract.paymentOptionDays ||
                row.contract.termDays }} Hari
            </span>
          </div>
        </div>
      </div>
      <button type="button" class="btn-close" aria-label="Close" @click="handleClose" />
    </div>

    <div class="modal-body pawn-contract-page__storage-fee-body">
      <div class="row g-4">
        <div class="col-lg-7">
          <section class="pawn-contract-page__storage-fee-section">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="h6 mb-0 text-uppercase fw-bold text-muted small">
                Pilih Periode Pembayaran
              </h3>
              <div class="form-check form-switch small cursor-pointer">
                <input id="selectAll" class="form-check-input" type="checkbox" role="switch" :checked="isAllSelected"
                  @change="toggleSelectAll">
                <label class="form-check-label text-secondary" for="selectAll">Pilih Semua</label>
              </div>
            </div>

            <div class="table-responsive border rounded-3 overflow-hidden bg-white">
              <table class="table table-hover mb-0 align-middle">
                <thead class="table-light">
                  <tr>
                    <th class="text-center" style="width: 50px">
                      #
                    </th>
                    <th>Deskripsi Periode</th>
                    <th class="text-end">
                      Nominal
                    </th>
                    <th class="text-center" style="width: 80px">
                      Bayar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="period in selectablePeriods" :key="period.id" :class="[
                    {
                      'table-primary-subtle': selectedPeriodIds.includes(period.id),
                      'opacity-50 grayscale bg-light': period.isPaid
                    },
                    period.isPaid ? '' : 'cursor-pointer'
                  ]" @click="period.isPaid ? null : togglePeriod(period.id)">
                    <td class="text-center text-secondary small">
                      <span v-if="typeof period.id === 'string' && period.id.startsWith('paid-')">
                        {{ period.id.replace('paid-', '') }}
                      </span>
                      <span v-else>
                        {{ period.id }}
                      </span>
                    </td>
                    <td>
                      <div class="fw-bold">
                        {{ period.label }}
                      </div>
                      <!-- <div class="text-secondary small">
                        Batas: {{ period.dueDateLabel }}
                      </div> -->
                    </td>
                    <td class="text-end fw-medium">
                      {{ formatCurrency(period.amount) }}
                    </td>
                    <td class="text-center">
                      <input class="form-check-input" type="checkbox"
                        :checked="period.isPaid || selectedPeriodIds.includes(period.id)" :disabled="period.isPaid"
                        @click.stop="period.isPaid ? null : togglePeriod(period.id)">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="card border mt-4 border-success-subtle bg-success-subtle mb-4 cursor-pointer align-items-center flex-row p-3 gap-3 transition-all"
              :class="{ 'shadow-sm': isPayingOff }" @click.prevent="togglePayoff">
              <div class="form-check m-0">
                <input class="form-check-input form-check-input-success fs-5 cursor-pointer m-0" type="checkbox"
                  :checked="isPayingOff" readonly>
              </div>
              <div class="flex-grow-1">
                <label class="form-check-label fw-bold text-success-emphasis cursor-pointer d-block mb-1">
                  Pembayaran Pelunasan
                </label>
                <p class="mb-0 text-success text-sm lh-sm">
                  Pokok Pinjaman: {{ formatCurrency(row?.contract.disbursedValue || 0) }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div class="col-lg-5">
          <div class="card border-0 shadow-sm sticky-top" style="top: 1rem">
            <div class="card-body p-4">
              <h3 class="h6 mb-4 text-uppercase fw-bold text-muted small">
                Ringkasan Pembayaran
              </h3>
              <div class="mb-4">
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                  <span class="text-secondary">Item Dipilih</span>
                  <span class="fw-bold">{{ selectedPeriodIds.length }} Periode</span>
                </div>
                <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                  <span class="text-secondary">Total Bayar</span>
                  <span class="fw-bold h4 mb-0" :class="totalSelectedAmount > 0 ? 'text-success' : 'text-secondary'">
                    {{ formatCurrency(totalSelectedAmount) }}
                  </span>
                </div>

                <div class="p-3 bg-light rounded-3 mb-4 border-start border-4"
                  :class="totalSelectedAmount > 0 ? 'border-success' : 'border-secondary'">
                  <label class="d-block text-secondary small fw-bold text-uppercase mb-1">Terbilang</label>
                  <div class="small fw-medium text-dark lh-sm">
                    {{ totalSelectedAmount > 0 ? amountInWords : '-' }}
                  </div>
                </div>

                <div class="p-3 mb-4 rounded-3 border">
                  <div class="d-flex justify-content-between mb-2 small text-secondary">
                    <span>Total Seluruh Tunggakan</span>
                    <span>{{ formatCurrency(totalPotentialAmount) }}</span>
                  </div>
                  <div class="d-flex justify-content-between fw-bold small">
                    <span>Sisa Tunggakan</span>
                    <span :class="remainingAmount > 0 ? 'text-warning' : 'text-success'">
                      {{ formatCurrency(remainingAmount) }}
                    </span>
                  </div>
                </div>
              </div>



              <button type="button" class="btn btn-primary w-100 py-3 fw-bold shadow-sm"
                :disabled="selectedPeriodIds.length === 0" @click="handleConfirm">
                Proses Pembayaran ({{ selectedPeriodIds.length }})
              </button>
              <button type="button" class="btn btn-link w-100 mt-2 text-decoration-none text-secondary"
                @click="handleClose">
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
import { storeToRefs } from 'pinia';
import BaseModalComponent from '@core/presentation/components/base_modal.component.vue';
import { pawnContractStorageFeeViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract_storage_fee.vm';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';

defineProps<{
  formatCurrency: (value: number) => string;
  formatDate: (value: string | null) => string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [row: PawnContractSummaryModel, selectedPeriods: number];
}>();

const vm = pawnContractStorageFeeViewModel();
const {
  row,
  selectedPeriodIds,
  selectablePeriods,
  totalPotentialAmount,
  totalSelectedAmount,
  remainingAmount,
  amountInWords,
  isAllSelected,
  isPayingOff
} = storeToRefs(vm);

const { togglePeriod, toggleSelectAll, togglePayoff } = vm;

function handleClose(): void {
  emit('close');
}

function handleConfirm(): void {
  if (row.value && selectedPeriodIds.value.length > 0) {
    emit('confirm', row.value, selectedPeriodIds.value.length);
  }
}
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

.cursor-pointer {
  cursor: pointer;
}

.table-primary-subtle {
  background-color: var(--bs-primary-bg-subtle) !important;
}

.sticky-top {
  z-index: 10;
}

.italic {
  font-style: italic;
}
</style>
