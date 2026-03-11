<template>
  <section class="pawn-contract-page__content-section">
    <div class="pawn-contract-page__section-eyebrow">
      Maintenance
    </div>
    <h2 class="pawn-contract-page__section-title mb-1">
      Window maintenance operasional
    </h2>
    <DataTableClientSideComponent
      :vm="dataTableVm"
      class="mt-3 pawn-contract-page__datatable"
    >
      <template #extra-actions>
        <button
          class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
          :class="{ 'is-active': hasActiveFilters }"
          type="button"
          @click="emit('open-filter')"
        >
          <i
            class="bi bi-sliders"
            aria-hidden="true"
          />
          <span>Filter gadai</span>
        </button>
      </template>
      <template #body="{ item }">
        <tr>
          <td data-label="Print">
            <button
              class="btn btn-sm pawn-contract-page__action-button pawn-contract-page__action-button--secondary"
              type="button"
            >
              Print
            </button>
          </td>
          <td data-label="ID">
            {{ item.source.contractId }}
          </td>
          <td data-label="Nama Nasabah">
            {{ item.source.customerName }}
          </td>
          <td data-label="Nama Barang">
            {{ item.source.itemNames }}
          </td>
          <td data-label="Tanggal Gadai">
            {{ formatDate(item.source.contractDate) }}
          </td>
          <td
            class="pawn-contract-page__cell-status"
            data-label="Ceklis"
          >
            <span
              class="status-badge pawn-contract-page__status-badge"
              :class="item.source.maintenanceRequired
                ? 'status-badge--warning'
                : 'status-badge--success'
              "
            >
              {{ item.source.checklistLabel }}
            </span>
          </td>
        </tr>
      </template>
      <template #empty>
        <div class="pawn-contract-page__empty-state mt-3">
          Belum ada gadai yang masuk window maintenance.
        </div>
      </template>
    </DataTableClientSideComponent>
  </section>
</template>

<script setup lang="ts">
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import type { PawnContractMaintenanceTableRow } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
  dataTableVm: DataTableClientSideVM<PawnContractMaintenanceTableRow>;
  hasActiveFilters: boolean;
  formatDate: (value: string | null) => string;
}>();

const emit = defineEmits<{
  'open-filter': [];
}>();
</script>
