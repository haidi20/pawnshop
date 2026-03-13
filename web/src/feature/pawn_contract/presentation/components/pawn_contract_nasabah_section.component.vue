<template>
  <section class="pawn-contract-page__content-section">
    <div class="pawn-contract-page__section-eyebrow">
      Kontrak Nasabah
    </div>
    <h2 class="pawn-contract-page__section-title mb-1">
      Daftar kontrak aktif
    </h2>
    <div class="pawn-contract-page__tabs mt-3">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="pawn-contract-page__tab"
        :class="{ 'is-active': activeTab === tab.key }"
        type="button"
        @click="emit('select-tab', tab.key)"
      >
        {{ tab.label }} <strong>{{ formatCount(tab.count) }}</strong>
      </button>
    </div>

    <div
      v-if="showOverviewTotals"
      class="pawn-contract-page__totals pawn-contract-page__totals--overview mt-3"
    >
      <div class="pawn-contract-page__total-item">
        <span>Total Nilai Pinjaman</span>
        <strong>{{ formatCurrency(overviewTotals.principalAmount) }}</strong>
      </div>
      <div class="pawn-contract-page__total-item">
        <span>Total Tunggakan</span>
        <strong>{{ formatCurrency(overviewTotals.arrearsAmount) }}</strong>
      </div>
      <div class="pawn-contract-page__total-item">
        <span>Jatuh Tempo Hari Ini</span>
        <strong>{{ formatCurrency(overviewTotals.dueTodayAmount) }}</strong>
      </div>
    </div>

    <div class="pawn-contract-page__section-actions">
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
    </div>

    <div class="d-grid gap-3 mt-3">
      <!-- feature\pawn_contract\presentation\view_models\pawn_contract.state.ts -->
      <article
        v-for="sectionTable in sectionTables"
        :key="sectionTable.key"
        class="pawn-contract-page__panel"
      >
        <div class="pawn-contract-page__panel-header mb-3">
          <div class="pawn-contract-page__panel-copy">
            <h3 class="pawn-contract-page__table-title mb-1">
              {{ sectionTable.label }}
            </h3>
            <p class="text-secondary mb-0">
              {{ sectionTable.description }}
            </p>
          </div>
          <div class="pawn-contract-page__panel-count text-secondary small">
            {{ formatCount(sectionTable.rows.length) }} kontrak
          </div>
        </div>

        <DataTableClientSideComponent
          :vm="sectionTable.vm"
          class="pawn-contract-page__datatable"
        >
          <template #body="{ item }">
            <tr>
              <td
                class="pawn-contract-page__cell-action"
                data-label="Aksi"
              >
                <button
                  class="btn btn-sm pawn-contract-page__action-button"
                  type="button"
                  @click="emit('open-action', item.source)"
                >
                  Aksi
                </button>
              </td>
              <td
                class="pawn-contract-page__cell-primary"
                data-label="Nama"
              >
                <div class="fw-semibold">
                  {{ item.source.customerName }}
                </div>
                <div class="text-secondary small">
                  {{ item.source.branchName }}
                </div>
              </td>
              <td data-label="No. Telp">
                {{ item.source.customerPhone }}
              </td>
              <td data-label="ID">
                {{ item.source.customerIdentity }}
              </td>
              <td data-label="Jaminan">
                {{ item.source.itemNames }}
              </td>
              <td data-label="Pinjaman">
                {{ formatCurrency(item.source.contract.disbursedValue) }}
              </td>
              <td data-label="Tunggakan">
                <div class="fw-semibold">
                  {{ formatCurrency(item.source.arrears.overdueAmount) }}
                </div>
                <div class="text-secondary small">
                  Hari ini: {{ formatCurrency(item.source.arrears.dueTodayAmount) }}
                </div>
              </td>
              <td
                class="pawn-contract-page__cell-date"
                data-label="Tanggal Gadai"
              >
                <div class="pawn-contract-page__date-text">
                  {{ formatDate(item.source.contract.contractDate) }}
                </div>
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
              <td
                class="pawn-contract-page__cell-status"
                data-label="Status Proses"
              >
                <span
                  class="status-badge pawn-contract-page__status-badge pawn-contract-page__process-status"
                  :class="getProcessStatusClass(item.source.processStatusLabel)"
                >
                  {{ item.source.processStatusLabel }}
                </span>
              </td>
            </tr>
          </template>
          <template #empty>
            <LocalDbFeedbackStateComponent
              state="empty"
              title="Belum ada kontrak pada bagian ini"
              description="Belum ada kontrak gadai yang cocok untuk seksi nasabah ini pada database lokal."
              note="Coba ubah tab atau filter agar data kontrak yang relevan ditampilkan."
              :framed="false"
              compact
            />
          </template>
        </DataTableClientSideComponent>

        <div class="pawn-contract-page__totals">
          <div class="pawn-contract-page__total-item">
            <span>Total Nilai Pinjaman</span>
            <strong>{{ formatCurrency(sectionTable.totals.principalAmount) }}</strong>
          </div>
          <div class="pawn-contract-page__total-item">
            <span>Total Tunggakan</span>
            <strong>{{ formatCurrency(sectionTable.totals.arrearsAmount) }}</strong>
          </div>
          <div class="pawn-contract-page__total-item">
            <span>Jatuh Tempo Hari Ini</span>
            <strong>{{ formatCurrency(sectionTable.totals.dueTodayAmount) }}</strong>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import type { PawnContractDueStateModel } from '@core/util/helpers';
import type {
  PawnContractNasabahSectionModel,
  PawnContractNasabahTabKeyModel,
  PawnContractSummaryModel,
  PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractNasabahSectionTableModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

defineProps<{
  tabs: Array<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>>;
  activeTab: PawnContractNasabahTabKeyModel;
  sectionTables: PawnContractNasabahSectionTableModel[];
  overviewTotals: PawnContractNasabahSectionModel['totals'];
  showOverviewTotals: boolean;
  hasActiveFilters: boolean;
  formatCurrency: (value: number) => string;
  formatDate: (value: string | null) => string;
  formatCount: (value: number) => string;
  getDueStateClass: (value: PawnContractDueStateModel) => string;
}>();

const emit = defineEmits<{
  'select-tab': [tab: PawnContractNasabahTabKeyModel];
  'open-filter': [];
  'open-action': [row: PawnContractSummaryModel];
}>();

const getProcessStatusClass = (label: string): string => {
  switch (label) {
    case 'Data Baru':
    case 'Perpanjangan':
      return 'status-badge--accent';
    case 'Bayar Biaya Titip':
      return 'status-badge--warning';
    case 'Pelunasan':
      return 'status-badge--success';
    case 'Lelang':
      return 'status-badge--danger';
    default:
      return 'status-badge--neutral';
  }
};
</script>
