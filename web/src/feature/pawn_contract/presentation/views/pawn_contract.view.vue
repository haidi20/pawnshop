<template>
  <LocalDbFeedbackStateComponent v-if="isLoading" state="loading" title="Memuat index gadai"
    description="Mengambil data kontrak operasional dari database lokal sesuai perusahaan dan akses cabang user aktif."
    note="Ringkasan, tabel, dan filter akan aktif setelah pembacaan kontrak lokal selesai." />

  <LocalDbFeedbackStateComponent v-else-if="error" state="error" title="Gagal memuat index gadai" :description="error"
    note="Coba muat ulang agar kontrak pada DB lokal perusahaan aktif dibaca kembali." action-label="Muat ulang"
    @action="vm.getPawnContractData()" />

  <LocalDbFeedbackStateComponent v-else-if="data && indexTabs.every((tab) => tab.count === 0)" state="empty"
    :title="canAccessAllBranches ? 'Belum ada data gadai' : 'Belum ada data gadai pada cabang user ini'" :description="canAccessAllBranches
      ? 'Database lokal perusahaan aktif belum memiliki kontrak gadai yang bisa ditampilkan.'
      : 'Belum ada kontrak gadai pada cabang assignment user aktif, atau cabang user belum diatur.'" :note="canAccessAllBranches
        ? 'Mulai input data pertama agar seluruh tab index dan ringkasan terisi.'
        : 'Jika user ini karyawan, owner perlu memastikan assignment cabangnya sudah benar di menu Sistem > User.'">
    <template #actions>
      <RouterLink v-if="canAccessAllBranches || sortedBranches.length > 0" class="btn btn-primary"
        :to="{ name: 'PawnContractForm' }">
        <i class="bi bi-plus-lg" />
        <span>Buat gadai baru</span>
      </RouterLink>
      <button class="btn btn-outline-secondary" type="button" @click="vm.getPawnContractData()">
        Muat ulang
      </button>
    </template>
  </LocalDbFeedbackStateComponent>

  <section v-else-if="data" class="pawn-contract-page">
    <section class="card border-0 shadow-sm pawn-contract-page__overview">
      <div class="card-body p-3">
        <div class="pawn-contract-page__overview-head">
          <div class="pawn-contract-page__tabs pawn-contract-page__tabs--index" role="tablist"
            aria-label="Kategori index gadai">
            <button v-for="tab in indexTabs" :key="tab.key"
              class="pawn-contract-page__tab pawn-contract-page__tab--index"
              :class="{ 'is-active': activeIndexTab === tab.key }" type="button" @click="openIndexTab(tab.key)">
              <span class="pawn-contract-page__tab-label">{{ tab.label }}</span>
              <strong class="pawn-contract-page__tab-count">{{ formatCount(tab.count) }}</strong>
            </button>
          </div>
        </div>

        <div class="pawn-contract-page__overview-body mt-3">
          <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
            <div class="pawn-contract-page__toolbar-copy">
              <div class="pawn-contract-page__section-eyebrow">
                Data Gadai
              </div>
              <h1 class="pawn-contract-page__toolbar-title mb-1">
                {{ activeIndexTabMeta.label }}
              </h1>
              <p class="pawn-contract-page__section-summary mb-0">
                {{ activeIndexTabMeta.description }}
              </p>
            </div>
            <RouterLink class="btn btn-primary pawn-contract-page__primary-action" :to="{ name: 'PawnContractForm' }">
              <i class="bi bi-plus-lg" aria-hidden="true" />
              <span>Buat gadai baru</span>
            </RouterLink>
          </div>
        </div>

        <div class="pawn-contract-page__content">
          <PawnContractNasabahSectionComponent v-if="activeIndexTab === pawnContractIndexTabKey.CustomerContracts"
            :tabs="nasabahTabs" :active-tab="activeNasabahTab" :section-tables="displayedNasabahSectionTables"
            :overview-totals="activeNasabahSection.totals"
            :show-overview-totals="activeNasabahTab === pawnContractNasabahTabKey.AllData"
            :has-active-filters="hasActiveFilters" :format-currency="formatCurrency" :format-date="formatDate"
            :format-count="formatCount" :get-due-state-class="getDueStateClass"
            @select-tab="setActiveNasabahTab($event)" @open-filter="openFilterModal()"
            @open-action="openActionModal($event)" />

          <PawnContractRingkasanSectionComponent v-else-if="activeIndexTab === pawnContractIndexTabKey.DailySummary"
            :metrics="ringkasanMetrics" :section-tables="ringkasanSectionTables"
            :pendapatan-vm="ringkasanPendapatanTableVm" :has-active-filters="hasActiveFilters"
            :format-currency="formatCurrency" :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass" @open-filter="openFilterModal()" />

          <PawnContractAjtSectionComponent v-else-if="activeIndexTab === pawnContractIndexTabKey.DueContracts"
            :options="ajtOptions" :active-type="activeAjtType" :data-table-vm="ajtDataTableVm"
            :has-active-filters="hasActiveFilters" :format-count="formatCount" :format-date="formatDate"
            :get-due-state-class="getDueStateClass" :get-term-label="getTermLabel"
            :get-contract-status-label="getContractStatusLabel" :get-contract-status-class="getContractStatusClass"
            @select-type="setActiveAjtType($event)" @open-filter="openFilterModal()" />

          <PawnContractRedeemedSectionComponent v-else-if="activeIndexTab === pawnContractIndexTabKey.RedeemedContracts"
            :data-table-vm="redeemedDataTableVm" :has-active-filters="hasActiveFilters" :format-date="formatDate"
            :format-currency="formatCurrency" :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass" @open-filter="openFilterModal()" />

          <PawnContractAuctionSectionComponent v-else-if="activeIndexTab === pawnContractIndexTabKey.AuctionContracts"
            :data-table-vm="auctionDataTableVm" :has-active-filters="hasActiveFilters" :format-date="formatDate"
            :format-currency="formatCurrency" :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass" @open-filter="openFilterModal()" />

          <PawnContractRefundSectionComponent v-else-if="activeIndexTab === pawnContractIndexTabKey.RefundContracts"
            :data-table-vm="refundDataTableVm" :get-due-state-class="getDueStateClass"
            :has-active-filters="hasActiveFilters" :format-date="formatDate"
            :format-currency="formatCurrency" :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass" @open-filter="openFilterModal()" />

          <PawnContractLocationSectionComponent
            v-else-if="activeIndexTab === pawnContractIndexTabKey.LocationDistribution" :options="locationOptions"
            :active-tab="activeLocationTab" :data-table-vm="locationDataTableVm" :has-active-filters="hasActiveFilters"
            :format-count="formatCount" :get-location-status-class="getLocationStatusClass"
            @select-tab="setActiveLocationTab($event)" @open-filter="openFilterModal()" />

          <PawnContractMaintenanceSectionComponent v-else-if="activeIndexTab === pawnContractIndexTabKey.Maintenance"
            :data-table-vm="maintenanceDataTableVm" :has-active-filters="hasActiveFilters" :format-date="formatDate"
            @open-filter="openFilterModal()" />
        </div>
      </div>
    </section>

    <PawnContractActionModalComponent :row="selectedActionRow" @close="closeActionModal()"
      @action="handleAction($event)" />

    <PawnContractStorageFeeView :format-currency="formatCurrency" :format-date="formatDate"
      @close="closeStorageFeeModal" @confirm="handleStorageFeeConfirm" />

    <PawnContractIndexFilterModalComponent :is-open="isFilterModalOpen" :branches="sortedBranches"
      :status-options="contractStatusOptions" :branch-filter="activeTableBranchFilter"
      :status-filter="activeTableStatusFilter" :has-active-filters="hasActiveFilters"
      :allow-all-branches="canAccessAllBranches" :is-branch-locked="isBranchLocked" @close="closeFilterModal()"
      @reset="resetFilterModal()" @apply="applyFilterModal($event)" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import type { PawnContractStatusModel } from '@core/util/helpers';
import {
  PawnContractIndexTabKeyEnum,
  PawnContractNasabahTabKeyEnum,
  type PawnContractIndexTabKeyModel,
  type PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import '@feature/pawn_contract/presentation/styles/pawn_contract.css';
import PawnContractActionModalComponent from '@feature/pawn_contract/presentation/components/pawn_contract_action_modal.component.vue';
import PawnContractGjtSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_gjt_section.component.vue';
import PawnContractIndexFilterModalComponent from '@feature/pawn_contract/presentation/components/pawn_contract_index_filter_modal.component.vue';
import PawnContractLocationSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_location_section.component.vue';
import PawnContractMaintenanceSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_maintenance_section.component.vue';
import PawnContractNasabahSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_nasabah_section.component.vue';
import PawnContractRedeemedSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_redeemed_section.component.vue';
import PawnContractAuctionSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_auction_section.component.vue';
import PawnContractRefundSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_refund_section.component.vue';
import PawnContractRingkasanSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_ringkasan_section.component.vue';
import PawnContractStorageFeeView from '@feature/pawn_contract/presentation/views/pawn_contract_storage_fee.view.vue';
import {
  getPawnContractIndexRouteByKey,
  resolvePawnContractIndexTabFromPath
} from '@feature/pawn_contract/util/pawn_contract_index_navigation';
import { pawnContractViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';
import { pawnContractStorageFeeViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract_storage_fee.vm';

const route = useRoute();
const router = useRouter();
const vm = pawnContractViewModel();
const storageFeeVm = pawnContractStorageFeeViewModel();
const {
  data,
  isLoading,
  error,
  activeIndexTab,
  activeNasabahTab,
  activeAjtType,
  activeLocationTab,
  activeTableBranchFilter,
  activeTableStatusFilter,
  sortedBranches,
  indexTabs,
  activeIndexTabMeta,
  nasabahTabs,
  activeNasabahSection,
  displayedNasabahSectionTables,
  ringkasanSectionTables,
  ringkasanMetrics,
  ajtOptions,
  ajtDataTableVm,
  redeemedDataTableVm,
  auctionDataTableVm,
  refundDataTableVm,
  locationOptions,
  locationDataTableVm,
  maintenanceDataTableVm,
  ringkasanPendapatanTableVm,
  hasActiveFilters,
  canAccessAllBranches,
  isBranchLocked
} = storeToRefs(vm);

const contractStatusOptions = vm.contractStatusOptions;
const pawnContractIndexTabKey = PawnContractIndexTabKeyEnum;
const pawnContractNasabahTabKey = PawnContractNasabahTabKeyEnum;
const isFilterModalOpen = ref(false);
const selectedActionRow = ref<PawnContractSummaryModel | null>(null);

const {
  formatCurrency,
  formatDate,
  formatCount,
  getContractStatusLabel,
  getContractStatusClass,
  getDueStateClass,
  getLocationStatusClass,
  getTermLabel,
  resetActiveFilters,
  setActiveIndexTabFilters,
  setActiveIndexTab,
  setActiveNasabahTab,
  setActiveAjtType,
  setActiveSettlementType,
  setActiveLocationTab
} = vm;

const openActionModal = (row: PawnContractSummaryModel): void => {
  selectedActionRow.value = row;
};

const closeActionModal = (): void => {
  selectedActionRow.value = null;
};

const handleAction = (key: string): void => {
  if (key === 'storage_fee') {
    openStorageFeeModal(selectedActionRow.value);
  }
};

const openStorageFeeModal = (row: PawnContractSummaryModel | null): void => {
  storageFeeVm.setRow(row);
};

const closeStorageFeeModal = (): void => {
  storageFeeVm.setRow(null);
};

const handleStorageFeeConfirm = (row: PawnContractSummaryModel, selectedPeriods: number): void => {
  console.log(`Confirm storage fee for ${row.contract.contractNumber}: ${selectedPeriods} periods`);
  closeStorageFeeModal();
};

const openFilterModal = (): void => {
  isFilterModalOpen.value = true;
};

const closeFilterModal = (): void => {
  isFilterModalOpen.value = false;
};

const applyFilterModal = (payload: {
  branchFilter: string;
  statusFilter: 'all' | PawnContractStatusModel;
}): void => {
  setActiveIndexTabFilters(payload);
  closeFilterModal();
};

const resetFilterModal = (): void => {
  resetActiveFilters();
  closeFilterModal();
};

const syncActiveIndexTabFromRoute = (): void => {
  const routeTabKey = resolvePawnContractIndexTabFromPath(route.path);

  if (activeIndexTab.value !== routeTabKey) {
    setActiveIndexTab(routeTabKey);
  }
};

const openIndexTab = async (tabKey: PawnContractIndexTabKeyModel): Promise<void> => {
  const targetRoute = getPawnContractIndexRouteByKey(tabKey);

  if (activeIndexTab.value !== tabKey) {
    setActiveIndexTab(tabKey);
  }

  if (route.path === targetRoute) {
    return;
  }

  await router.push(targetRoute);
};

watch(
  () => route.path,
  () => {
    syncActiveIndexTabFromRoute();
  },
  { immediate: true }
);

onMounted(() => {
  void vm.getPawnContractData();
});
</script>
