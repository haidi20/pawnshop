<template>
  <section
    v-if="isLoading"
    class="card p-3"
  >
    <div class="d-flex align-items-center gap-3">
      <div
        class="spinner-border text-primary"
        role="status"
        aria-hidden="true"
      />
      <div>
        <div class="fw-bold">
          Memuat Index Gadai
        </div>
        <div class="text-secondary">
          Mengambil data kontrak operasional dari DB lokal.
        </div>
      </div>
    </div>
  </section>

  <section
    v-else-if="error"
    class="card p-3"
  >
    <div class="fw-bold text-danger mb-2">
      Feature load failed
    </div>
    <p class="mb-3 text-secondary">
      {{ error }}
    </p>
    <button
      class="btn btn-primary"
      type="button"
      @click="vm.getPawnContractData()"
    >
      Muat ulang
    </button>
  </section>

  <section
    v-else-if="data"
    class="pawn-contract-page"
  >
    <section class="card border-0 shadow-sm pawn-contract-page__overview">
      <div class="card-body p-3">
        <div class="pawn-contract-page__overview-head">
          <div
            class="pawn-contract-page__tabs pawn-contract-page__tabs--index"
            role="tablist"
            aria-label="Kategori index gadai"
          >
            <button
              v-for="tab in indexTabs"
              :key="tab.key"
              class="pawn-contract-page__tab pawn-contract-page__tab--index"
              :class="{ 'is-active': activeIndexTab === tab.key }"
              type="button"
              @click="openIndexTab(tab.key)"
            >
              <span class="pawn-contract-page__tab-label">{{ tab.label }}</span>
              <strong class="pawn-contract-page__tab-count">{{ formatCount(tab.count) }}</strong>
            </button>
          </div>
        </div>

        <div class="pawn-contract-page__overview-body mt-3">
          <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
            <div class="pawn-contract-page__toolbar-copy">
              <div class="pawn-contract-page__section-eyebrow">
                Index Gadai
              </div>
              <h1 class="pawn-contract-page__toolbar-title mb-1">
                {{ activeIndexTabMeta.label }}
              </h1>
              <p class="pawn-contract-page__section-summary mb-0">
                {{ activeIndexTabMeta.description }}
              </p>
            </div>
            <RouterLink
              class="btn btn-primary pawn-contract-page__primary-action"
              :to="{ name: 'PawnContractForm' }"
            >
              <i
                class="bi bi-plus-lg"
                aria-hidden="true"
              />
              <span>Buat gadai baru</span>
            </RouterLink>
          </div>
        </div>

        <div class="pawn-contract-page__content">
          <PawnContractNasabahSectionComponent
            v-if="activeIndexTab === pawnContractIndexTabKey.CustomerContracts"
            :tabs="nasabahTabs"
            :active-tab="activeNasabahTab"
            :section-tables="displayedNasabahSectionTables"
            :overview-totals="activeNasabahSection.totals"
            :show-overview-totals="activeNasabahTab === pawnContractNasabahTabKey.AllData"
            :has-active-filters="hasActiveFilters"
            :format-currency="formatCurrency"
            :format-date="formatDate"
            :format-count="formatCount"
            :get-due-state-class="getDueStateClass"
            @select-tab="setActiveNasabahTab($event)"
            @open-filter="openFilterModal()"
            @open-action="openActionModal($event)"
          />

          <PawnContractRingkasanSectionComponent
            v-else-if="activeIndexTab === pawnContractIndexTabKey.DailySummary"
            :metrics="ringkasanMetrics"
            :section-tables="ringkasanSectionTables"
            :pendapatan-vm="ringkasanPendapatanTableVm"
            :has-active-filters="hasActiveFilters"
            :format-currency="formatCurrency"
            :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass"
            @open-filter="openFilterModal()"
          />

          <PawnContractAjtSectionComponent
            v-else-if="activeIndexTab === pawnContractIndexTabKey.DueContracts"
            :options="ajtOptions"
            :active-type="activeAjtType"
            :data-table-vm="ajtDataTableVm"
            :has-active-filters="hasActiveFilters"
            :format-count="formatCount"
            :format-date="formatDate"
            :get-due-state-class="getDueStateClass"
            :get-term-label="getTermLabel"
            :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass"
            @select-type="setActiveAjtType($event)"
            @open-filter="openFilterModal()"
          />

          <PawnContractSettlementSectionComponent
            v-else-if="activeIndexTab === pawnContractIndexTabKey.SettlementAuction"
            :options="settlementOptions"
            :active-type="activeSettlementType"
            :data-table-vm="settlementDataTableVm"
            :has-active-filters="hasActiveFilters"
            :format-count="formatCount"
            :format-date="formatDate"
            :format-currency="formatCurrency"
            :get-contract-status-label="getContractStatusLabel"
            :get-contract-status-class="getContractStatusClass"
            @select-type="setActiveSettlementType($event)"
            @open-filter="openFilterModal()"
          />

          <PawnContractLocationSectionComponent
            v-else-if="activeIndexTab === pawnContractIndexTabKey.LocationDistribution"
            :options="locationOptions"
            :active-tab="activeLocationTab"
            :data-table-vm="locationDataTableVm"
            :has-active-filters="hasActiveFilters"
            :format-count="formatCount"
            :get-location-status-class="getLocationStatusClass"
            @select-tab="setActiveLocationTab($event)"
            @open-filter="openFilterModal()"
          />

          <PawnContractMaintenanceSectionComponent
            v-else-if="activeIndexTab === pawnContractIndexTabKey.Maintenance"
            :data-table-vm="maintenanceDataTableVm"
            :has-active-filters="hasActiveFilters"
            :format-date="formatDate"
            @open-filter="openFilterModal()"
          />
        </div>
      </div>
    </section>

    <PawnContractActionModalComponent
      :row="selectedActionRow"
      @close="closeActionModal()"
    />

    <PawnContractIndexFilterModalComponent
      :is-open="isFilterModalOpen"
      :branches="sortedBranches"
      :status-options="contractStatusOptions"
      :branch-filter="branchFilter"
      :status-filter="statusFilter"
      :has-active-filters="hasActiveFilters"
      @close="closeFilterModal()"
      @reset="resetFilterModal()"
      @apply="applyFilterModal($event)"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import type { PawnContractStatusModel } from '@core/util/helpers';
import {
  PawnContractIndexTabKeyEnum,
  PawnContractNasabahTabKeyEnum,
  type PawnContractIndexTabKeyModel,
  type PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import '@feature/pawn_contract/presentation/styles/pawn_contract.css';
import PawnContractActionModalComponent from '@feature/pawn_contract/presentation/components/pawn_contract_action_modal.component.vue';
import PawnContractAjtSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_ajt_section.component.vue';
import PawnContractIndexFilterModalComponent from '@feature/pawn_contract/presentation/components/pawn_contract_index_filter_modal.component.vue';
import PawnContractLocationSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_location_section.component.vue';
import PawnContractMaintenanceSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_maintenance_section.component.vue';
import PawnContractNasabahSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_nasabah_section.component.vue';
import PawnContractRingkasanSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_ringkasan_section.component.vue';
import PawnContractSettlementSectionComponent from '@feature/pawn_contract/presentation/components/pawn_contract_settlement_section.component.vue';
import {
  getPawnContractIndexRouteByKey,
  resolvePawnContractIndexTabFromPath
} from '@feature/pawn_contract/util/pawn_contract_index_navigation';
import { pawnContractViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

const route = useRoute();
const router = useRouter();
const vm = pawnContractViewModel();
const {
  data,
  isLoading,
  error,
  activeIndexTab,
  activeNasabahTab,
  activeAjtType,
  activeSettlementType,
  activeLocationTab,
  branchFilter,
  statusFilter,
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
  settlementOptions,
  settlementDataTableVm,
  locationOptions,
  locationDataTableVm,
  maintenanceDataTableVm,
  ringkasanPendapatanTableVm,
  hasActiveFilters
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
  resetFilters,
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
  branchFilter.value = payload.branchFilter;
  statusFilter.value = payload.statusFilter;
  closeFilterModal();
};

const resetFilterModal = (): void => {
  resetFilters();
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
