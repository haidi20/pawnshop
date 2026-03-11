<template>
  <section class="pawn-contract-page__content-stack">
    <section class="pawn-contract-page__content-panel">
      <div class="pawn-contract-page__section-eyebrow">
        Ringkasan Harian
      </div>
      <h2 class="pawn-contract-page__section-title mb-1">
        Aktivitas hari ini
      </h2>
      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-3 mt-3">
        <article class="col">
          <div class="pawn-contract-page__metric-card">
            <span>Gadai Baru</span><strong>{{ formatCurrency(metrics.akadBaru) }}</strong>
          </div>
        </article>
        <article class="col">
          <div class="pawn-contract-page__metric-card">
            <span>Gadai Ulang</span><strong>{{ formatCurrency(metrics.akadUlang) }}</strong>
          </div>
        </article>
        <article class="col">
          <div class="pawn-contract-page__metric-card">
            <span>Total Realisasi</span><strong>{{ formatCurrency(metrics.totalRealisasi) }}</strong>
          </div>
        </article>
        <article class="col">
          <div class="pawn-contract-page__metric-card">
            <span>Pendapatan B. Titip</span><strong>{{ formatCurrency(metrics.pendapatanBtitip) }}</strong>
          </div>
        </article>
        <article class="col">
          <div class="pawn-contract-page__metric-card">
            <span>Pendapatan B. Admin</span><strong>{{ formatCurrency(metrics.pendapatanBadmin) }}</strong>
          </div>
        </article>
      </div>
    </section>

    <section class="row g-3">
      <div
        v-for="sectionTable in sectionTables"
        :key="sectionTable.key"
        class="col-12 col-xl-6"
      >
        <article class="pawn-contract-page__content-panel h-100">
          <h3 class="pawn-contract-page__table-title mb-1">
            {{ sectionTable.label }}
          </h3>
          <p class="text-secondary mb-3">
            {{ sectionTable.description }}
          </p>
          <DataTableClientSideComponent
            :vm="sectionTable.vm"
            class="pawn-contract-page__datatable"
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
                <td data-label="Pinjaman">
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
                title="Belum ada aktivitas hari ini"
                description="Kategori ringkasan ini belum memiliki kontrak yang cocok pada database lokal hari ini."
                note="Data akan muncul saat transaksi atau kontrak baru masuk sesuai kategori tersebut."
                :framed="false"
                compact
              />
            </template>
          </DataTableClientSideComponent>
        </article>
      </div>
    </section>

    <section class="pawn-contract-page__content-panel">
      <h3 class="pawn-contract-page__table-title mb-1">
        Data Pendapatan
      </h3>
      <DataTableClientSideComponent
        :vm="pendapatanVm"
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
        <template #empty>
          <LocalDbFeedbackStateComponent
            state="empty"
            title="Belum ada pendapatan hari ini"
            description="Pendapatan biaya titip dan administrasi belum tercatat pada database lokal hari ini."
            note="Tabel ini akan terisi otomatis saat data kontrak dan transaksi yang relevan tersedia."
            :framed="false"
            compact
          />
        </template>
      </DataTableClientSideComponent>
    </section>
  </section>
</template>

<script setup lang="ts">
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import type { PawnContractStatusModel } from '@core/util/helpers';
import type { PawnContractRingkasanMetricModel } from '@feature/pawn_contract/domain/models';
import type {
  PawnContractRingkasanPendapatanTableRow,
  PawnContractRingkasanSectionTableModel
} from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';

defineProps<{
  metrics: PawnContractRingkasanMetricModel;
  sectionTables: PawnContractRingkasanSectionTableModel[];
  pendapatanVm: DataTableClientSideVM<PawnContractRingkasanPendapatanTableRow>;
  hasActiveFilters: boolean;
  formatCurrency: (value: number) => string;
  getContractStatusLabel: (value: PawnContractStatusModel) => string;
  getContractStatusClass: (value: PawnContractStatusModel) => string;
}>();

const emit = defineEmits<{
  'open-filter': [];
}>();
</script>
