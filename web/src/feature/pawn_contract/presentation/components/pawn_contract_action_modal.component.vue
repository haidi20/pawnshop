<template>
  <template v-if="row">
    <section
      class="modal fade show d-block pawn-contract-page__action-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-label="Aksi gadai"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable pawn-contract-page__action-dialog">
        <div class="modal-content border-0 pawn-contract-page__action-content">
          <div class="modal-header pawn-contract-page__action-header">
            <div>
              <div class="pawn-contract-page__section-eyebrow mb-2">
                Aksi Gadai
              </div>
              <h2 class="h5 mb-1">
                {{ row.customerName }}
              </h2>
              <p class="mb-0 text-secondary">
                {{ row.contract.contractNumber }} - {{ row.itemNames }}
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="emit('close')"
            />
          </div>

          <div class="modal-body pawn-contract-page__action-body">
            <div class="pawn-contract-page__action-layout">
              <div class="pawn-contract-page__action-list">
                <button
                  v-for="action in row.availableActions"
                  :key="action.key"
                  type="button"
                  class="pawn-contract-page__action-item"
                  :class="{ 'is-active': selectedActionKey === action.key }"
                  @click="setSelectedActionKey(action.key)"
                >
                  <span class="pawn-contract-page__action-item-label">{{ action.label }}</span>
                  <small class="text-secondary">{{ action.description }}</small>
                </button>
              </div>

              <div class="pawn-contract-page__action-detail">
                <div class="d-flex flex-wrap justify-content-between gap-3 align-items-start">
                  <div>
                    <h3 class="pawn-contract-page__table-title mb-1">
                      {{ selectedActionOption?.label ?? 'Aksi' }}
                    </h3>
                    <p class="text-secondary mb-0">
                      {{ selectedActionOption?.description ?? '-' }}
                    </p>
                  </div>
                  <span
                    class="status-badge"
                    :class="getProcessStatusClass(row.processStatusLabel)"
                  >
                    {{ row.processStatusLabel }}
                  </span>
                </div>

                <div
                  v-if="selectedActionKey === 'history'"
                  class="pawn-contract-page__history-list mt-4"
                >
                  <article
                    v-for="entry in selectedActionHistoryEntries"
                    :key="entry.key"
                    class="pawn-contract-page__history-item"
                  >
                    <span>{{ entry.label }}</span>
                    <strong>{{ entry.value }}</strong>
                  </article>
                </div>

                <div
                  v-else
                  class="pawn-contract-page__action-summary mt-4"
                >
                  <div class="pawn-contract-page__history-list">
                    <article class="pawn-contract-page__history-item">
                      <span>Status kontrak</span>
                      <strong>{{ getContractStatusLabel(row.contract.contractStatus) }}</strong>
                    </article>
                    <article class="pawn-contract-page__history-item">
                      <span>Jatuh tempo</span>
                      <strong>{{ formatDate(row.contract.maturityDate) }}</strong>
                    </article>
                    <article class="pawn-contract-page__history-item">
                      <span>Cabang</span>
                      <strong>{{ row.branchName }}</strong>
                    </article>
                    <article class="pawn-contract-page__history-item">
                      <span>Lokasi barang</span>
                      <strong>{{ row.locationLabel }}</strong>
                    </article>
                  </div>

                  <div class="pawn-contract-page__action-cta mt-4">
                    <RouterLink
                      v-if="selectedActionKey === 'edit'"
                      class="btn btn-primary"
                      :to="{ name: 'PawnContractFormEdit', params: { contractId: row.contract.id } }"
                      @click="emit('close')"
                    >
                      Buka form edit
                    </RouterLink>
                    <button
                      v-else
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="emit('close')"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer pawn-contract-page__action-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="emit('close')"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </section>
    <div
      class="modal-backdrop fade show pawn-contract-page__action-backdrop"
      @click="emit('close')"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import {
  formatDateTimeForHumans,
  formatDateValueForHumans,
  getPawnContractStatusLabel
} from '@core/util/helpers';
import type { PawnContractActionKeyModel, PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';

const props = defineProps<{
  row: PawnContractSummaryModel | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const selectedActionKey = ref<PawnContractActionKeyModel>('edit');

const selectedActionOption = computed(() => {
  if (!props.row) {
    return null;
  }

  return (
    props.row.availableActions.find((action) => action.key === selectedActionKey.value) ??
    props.row.availableActions[0] ??
    null
  );
});

const selectedActionHistoryEntries = computed(() => {
  if (!props.row) {
    return [];
  }

  return [
    { key: 'created-at', label: 'Gadai dibuat', value: formatDateTime(props.row.contract.createdAt) },
    { key: 'updated-at', label: 'Terakhir diperbarui', value: formatDateTime(props.row.contract.updatedAt) },
    { key: 'contract-date', label: 'Tanggal gadai', value: formatDate(props.row.contract.contractDate) },
    { key: 'maturity-date', label: 'Jatuh tempo', value: formatDate(props.row.contract.maturityDate) },
    {
      key: 'contract-status',
      label: 'Status kontrak',
      value: getContractStatusLabel(props.row.contract.contractStatus)
    },
    { key: 'process-status', label: 'Status proses', value: props.row.processStatusLabel },
    { key: 'location', label: 'Lokasi barang', value: props.row.locationLabel }
  ];
});

const formatDate = (value: string | null): string => formatDateValueForHumans(value);
const formatDateTime = (value: string | null): string => formatDateTimeForHumans(value);
const getContractStatusLabel = (value: PawnContractSummaryModel['contract']['contractStatus']): string =>
  getPawnContractStatusLabel(value);

const getProcessStatusClass = (label: string): string => {
  switch (label) {
    case 'Data Baru':
    case 'Perpanjangan':
      return 'status-badge--accent';
    case 'Bayar B. Titip':
      return 'status-badge--warning';
    case 'Pelunasan':
      return 'status-badge--success';
    case 'Lelang':
      return 'status-badge--danger';
    default:
      return 'status-badge--neutral';
  }
};

const setSelectedActionKey = (key: PawnContractActionKeyModel): void => {
  selectedActionKey.value = key;
};

watch(
  () => props.row,
  (value) => {
    document.body.classList.toggle('modal-open', value !== null);
    selectedActionKey.value = value?.availableActions[0]?.key ?? 'edit';
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.body.classList.remove('modal-open');
});
</script>
