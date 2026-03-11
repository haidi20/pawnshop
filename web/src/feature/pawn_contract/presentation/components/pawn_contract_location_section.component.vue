<template>
  <section class="pawn-contract-page__content-section">
    <div class="pawn-contract-page__section-eyebrow">
      Lokasi / Distribusi
    </div>
    <h2 class="pawn-contract-page__section-title mb-1">
      Mutasi lokasi barang jaminan
    </h2>
    <div class="pawn-contract-page__tabs mt-3">
      <button
        v-for="option in options"
        :key="option.key"
        class="pawn-contract-page__tab"
        :class="{ 'is-active': activeTab === option.key }"
        type="button"
        @click="emit('select-tab', option.key)"
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
      <template #body="{ item, index }">
        <tr>
          <td data-label="No">
            {{ dataTableVm.offset + index + 1 }}
          </td>
          <td data-label="Nama Barang">
            <div class="fw-semibold">
              {{ item.source.itemName }}
            </div>
            <div class="text-secondary small">
              {{ item.source.contractNumber }}
            </div>
          </td>
          <td data-label="Nasabah">
            {{ item.source.customerName }}
          </td>
          <td data-label="Cabang">
            {{ item.source.branchName }}
          </td>
          <td
            class="pawn-contract-page__cell-status"
            data-label="Lokasi"
          >
            <span
              class="status-badge pawn-contract-page__status-badge"
              :class="getLocationStatusClass(item.source.currentLocationStatus)"
            >
              {{ item.source.currentLocationLabel }}
            </span>
          </td>
          <td data-label="Action">
            <div class="d-flex flex-wrap gap-2">
              <button
                class="btn btn-sm btn-outline-dark"
                type="button"
              >
                {{ item.source.primaryActionLabel }}
              </button>
              <button
                v-if="item.source.secondaryActionLabel"
                class="btn btn-sm btn-outline-secondary"
                type="button"
              >
                {{ item.source.secondaryActionLabel }}
              </button>
            </div>
          </td>
          <td data-label="Print">
            <button
              class="btn btn-sm btn-outline-secondary"
              type="button"
            >
              Print
            </button>
          </td>
        </tr>
      </template>
      <template #empty>
        <div class="pawn-contract-page__empty-state mt-3">
          Tidak ada barang untuk kategori lokasi ini.
        </div>
      </template>
    </DataTableClientSideComponent>
  </section>
</template>

<script setup lang="ts">
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import type { PawnItemLocationStatusModel } from '@feature/pawn_contract/domain/models/pawn-item.model';
import type {
  PawnContractLocationTabModel,
  PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractLocationTableRow } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
  options: Array<PawnContractTableOptionModel<PawnContractLocationTabModel>>;
  activeTab: PawnContractLocationTabModel;
  dataTableVm: DataTableClientSideVM<PawnContractLocationTableRow>;
  hasActiveFilters: boolean;
  formatCount: (value: number) => string;
  getLocationStatusClass: (value: PawnItemLocationStatusModel | null) => string;
}>();

const emit = defineEmits<{
  'select-tab': [tab: PawnContractLocationTabModel];
  'open-filter': [];
}>();
</script>
