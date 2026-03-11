<template>
  <section class="pawn-contract-page__content-section">
    <div class="pawn-contract-page__section-eyebrow">
      Gadai Jatuh Tempo
    </div>
    <h2 class="pawn-contract-page__section-title mb-1">
      Pilihan jenis jatuh tempo
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
          <span>Filter Gadai</span>
        </button>
      </template>
      <template #body="{ item }">
        <tr>
          <td
            class="pawn-contract-page__cell-action"
            data-label="Aksi"
          >
            <RouterLink
              class="btn btn-sm pawn-contract-page__action-button"
              :to="{
                name: 'PawnContractFormEdit',
                params: { contractId: item.source.contract.id },
              }"
            >
              Ubah
            </RouterLink>
          </td>
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
            data-label="Jatuh Tempo"
          >
            <div class="pawn-contract-page__date-text">
              {{ formatDate(item.source.contract.maturityDate) }}
            </div>
            <span
              class="status-badge pawn-contract-page__status-badge pawn-contract-page__status-badge--due mt-1"
              :class="getDueStateClass(item.source.dueState)"
            >
              {{ item.source.dueLabel }}
            </span>
          </td>
          <td data-label="Tenor">
            {{ getTermLabel(item.source.contract.termDays) }}
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
          title="Belum ada data jatuh tempo"
          description="Tidak ada kontrak gadai untuk kategori jatuh tempo ini pada database lokal yang sedang diakses."
          note="Ubah filter atau tunggu data kontrak dari cabang terkait tersedia."
          :framed="false"
          compact
        />
      </template>
    </DataTableClientSideComponent>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import type {
  PawnContractDueStateModel,
  PawnContractStatusModel
} from '@core/util/helpers';
import type {
  PawnContractAjtTypeModel,
  PawnContractSummaryModel,
  PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractSummaryTableRow } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
  options: Array<PawnContractTableOptionModel<PawnContractAjtTypeModel>>;
  activeType: PawnContractAjtTypeModel;
  dataTableVm: DataTableClientSideVM<PawnContractSummaryTableRow>;
  hasActiveFilters: boolean;
  formatCount: (value: number) => string;
  formatDate: (value: string | null) => string;
  getDueStateClass: (value: PawnContractDueStateModel) => string;
  getTermLabel: (value: number) => string;
  getContractStatusLabel: (value: PawnContractStatusModel) => string;
  getContractStatusClass: (value: PawnContractStatusModel) => string;
}>();

const emit = defineEmits<{
  'select-type': [type: PawnContractAjtTypeModel];
  'open-filter': [];
}>();
</script>
