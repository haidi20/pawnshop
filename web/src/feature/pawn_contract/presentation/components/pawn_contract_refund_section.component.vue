<script setup lang="ts">
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import type { PawnContractSummaryTableRow } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
    dataTableVm: DataTableClientSideVM<PawnContractSummaryTableRow>;
    getDueStateClass: (dueState: any) => string;
}>();

defineEmits<{
    (e: 'open-filter'): void;
}>();
</script>

<template>
  <div class="pawn-contract-refund-section">
    <div class="section-header mb-4">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="section-title mb-1">
            Data Refund
          </h5>
          <p class="section-description text-muted mb-0">
            Daftar kontrak batal yang memerlukan proses pengembalian dana (refund).
          </p>
        </div>
        <div class="section-actions">
          <button
            class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            @click="$emit('open-filter')"
          >
            <i class="bi bi-filter" />
            Filter Data
          </button>
        </div>
      </div>
    </div>

    <div class="section-content">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th
                    v-for="field in dataTableVm.fields"
                    :key="field.key"
                    class="text-nowrap py-3 px-4"
                  >
                    {{ field.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in dataTableVm.items"
                  :key="row.id"
                >
                  <td class="px-4 py-3">
                    <span class="fw-medium text-primary">{{ row.contractNumber }}</span>
                  </td>
                  <td class="px-4">
                    <div class="fw-medium">
                      {{ row.customerName }}
                    </div>
                  </td>
                  <td class="px-4">
                    <div
                      class="text-truncate"
                      style="max-width: 200px"
                    >
                      {{ row.itemNames }}
                    </div>
                  </td>
                  <td class="px-4 text-nowrap">
                    {{ row.refundDate }}
                  </td>
                  <td class="px-4 text-nowrap fw-semibold">
                    {{ row.principalAmount }}
                  </td>
                  <td class="px-4">
                    <span
                      class="badge rounded-pill"
                      :class="getDueStateClass(row.source.dueState)"
                    >
                      {{ row.statusLabel }}
                    </span>
                  </td>
                </tr>
                <tr v-if="dataTableVm.items.length === 0">
                  <td
                    :colspan="dataTableVm.fields.length"
                    class="text-center py-5 text-muted"
                  >
                    <div class="py-4">
                      <i class="bi bi-inbox fs-1 d-block mb-3 opacity-25" />
                      Tidak ada data refund yang ditemukan.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
    font-weight: 700;
    color: var(--bs-heading-color);
}

.section-description {
    font-size: 0.875rem;
}

.table thead th {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: var(--bs-secondary-color);
}

.table tbody td {
    font-size: 0.875rem;
}
</style>
