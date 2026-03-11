<template>
  <section class="pawn-contract-page__content-section">
    <div class="pawn-contract-page__section-eyebrow">
      Pelunasan dan Lelang
    </div>
    <h2 class="pawn-contract-page__section-title mb-1">
      Data lunas, lelang, dan refund
    </h2>
    <div class="pawn-contract-page__tabs mt-3">
      <button
        v-for="option in options"
        :key="option.key"
        class="pawn-contract-page__tab"
        :class="{ 'is-active': activeType === option.key }"
        type="button"
        @click="emit('select-type', option.key)"
      >
        {{ option.label }} <strong>{{ formatCount(option.count) }}</strong>
      </button>
    </div>
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
            data-label="Tanggal"
          >
            {{
              formatDate(
                item.source.contract.updatedAt?.slice(0, 10) ??
                  item.source.contract.maturityDate
              )
            }}
          </td>
          <td data-label="Nilai">
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
        <div class="pawn-contract-page__empty-state mt-3">
          Belum ada kontrak pada kategori ini.
        </div>
      </template>
    </DataTableClientSideComponent>
  </section>
</template>

<script setup lang="ts">
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import type { PawnContractStatusModel } from '@core/util/helpers';
import type {
  PawnContractSettlementTypeModel,
  PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractSummaryTableRow } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
  options: Array<PawnContractTableOptionModel<PawnContractSettlementTypeModel>>;
  activeType: PawnContractSettlementTypeModel;
  dataTableVm: DataTableClientSideVM<PawnContractSummaryTableRow>;
  hasActiveFilters: boolean;
  formatCount: (value: number) => string;
  formatDate: (value: string | null) => string;
  formatCurrency: (value: number) => string;
  getContractStatusLabel: (value: PawnContractStatusModel) => string;
  getContractStatusClass: (value: PawnContractStatusModel) => string;
}>();

const emit = defineEmits<{
  'select-type': [type: PawnContractSettlementTypeModel];
  'open-filter': [];
}>();
</script>
