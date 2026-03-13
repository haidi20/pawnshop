<template>
  <section class="pawn-contract-page__content-section">
    <div class="pawn-contract-page__section-eyebrow">
      Kontrak Lunas
    </div>
    <h2 class="pawn-contract-page__section-title mb-1">
      Daftar kontrak yang sudah dilunasi
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
          <td data-label="No. Gadai">
            {{ item.source.contract.contractNumber }}
          </td>
          <td data-label="Nasabah">
            {{ item.source.customerName }}
          </td>
          <td data-label="Jaminan">
            {{ item.source.itemNames }}
          </td>
          <td
            class="pawn-contract-page__cell-date"
            data-label="Tanggal Pelunasan"
          >
            {{
              formatDate(
                item.source.contract.updatedAt?.slice(0, 10) ??
                  item.source.contract.maturityDate
              )
            }}
          </td>
          <td data-label="Nilai Pencairan">
            {{ formatCurrency(item.source.contract.disbursedValue) }}
          </td>
          <td
            class="pawn-contract-page__cell-status"
            data-label="Status"
          >
            <span
              class="status-badge pawn-contract-page__status-badge"
              :class="getContractStatusClass(item.source.contract.contractStatus)"
            >
              {{ getContractStatusLabel(item.source.contract.contractStatus) }}
            </span>
          </td>
        </tr>
      </template>
      <template #empty>
        <LocalDbFeedbackStateComponent
          state="empty"
          title="Belum ada data kontrak lunas"
          description="Tidak ada kontrak dengan status lunas atau closed di database lokal yang sedang dibuka."
          note="Periksa filter yang diterapkan atau tunggu transaksi pelunasan tercatat."
          :framed="false"
          compact
        />
      </template>
    </DataTableClientSideComponent>
  </section>
</template>

<script setup lang="ts">
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import type { PawnContractStatusModel } from '@core/util/helpers';
import type { PawnContractSummaryTableRow } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
  dataTableVm: DataTableClientSideVM<PawnContractSummaryTableRow>;
  hasActiveFilters: boolean;
  formatDate: (value: string | null) => string;
  formatCurrency: (value: number) => string;
  getContractStatusLabel: (value: PawnContractStatusModel) => string;
  getContractStatusClass: (value: PawnContractStatusModel) => string;
}>();

const emit = defineEmits<{
  'open-filter': [];
}>();
</script>
