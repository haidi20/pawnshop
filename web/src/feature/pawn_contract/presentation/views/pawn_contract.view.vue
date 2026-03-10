<template>
  <section
    v-if="isLoading"
    class="card p-4"
  >
    <div class="d-flex align-items-center gap-3">
      <div
        class="spinner-border text-primary"
        role="status"
        aria-hidden="true"
      />
      <div>
        <div class="fw-bold">
          Memuat Index Akad
        </div>
        <div class="text-secondary">
          Mengambil data kontrak operasional dari DB lokal.
        </div>
      </div>
    </div>
  </section>

  <section
    v-else-if="error"
    class="card p-4"
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
    <section class="card border-0 shadow-sm pawn-contract-page__nav">
      <div class="card-body p-3 p-lg-4">
        <div
          class="pawn-contract-page__tabs pawn-contract-page__tabs--index"
          role="tablist"
          aria-label="Kategori index akad"
        >
          <button
            v-for="tab in indexTabs"
            :key="tab.key"
            class="pawn-contract-page__tab pawn-contract-page__tab--index"
            :class="{ 'is-active': activeIndexTab === tab.key }"
            type="button"
            @click="setActiveIndexTab(tab.key)"
          >
            <span>{{ tab.label }}</span>
            <strong>{{ formatCount(tab.count) }}</strong>
          </button>
        </div>
      </div>
    </section>

    <section class="card border-0 shadow-sm pawn-contract-page__toolbar">
      <div class="card-body p-4">
        <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-4">
          <div class="pawn-contract-page__toolbar-copy">
            <div class="pawn-contract-page__section-eyebrow">
              Index Akad
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
            <span>Buat akad baru</span>
          </RouterLink>
        </div>

        <div class="row g-3 mt-1">
          <div class="col-12 col-md-5">
            <label
              class="form-label fw-semibold"
              for="pawn-contract-branch-filter"
            >Cabang</label>
            <select
              id="pawn-contract-branch-filter"
              v-model="branchFilter"
              class="form-select"
            >
              <option value="all">
                Semua cabang
              </option>
              <option
                v-for="branch in sortedBranches"
                :key="branch.id"
                :value="String(branch.id)"
              >
                {{ branch.branchName }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-5">
            <label
              class="form-label fw-semibold"
              for="pawn-contract-status-filter"
            >Status kontrak</label>
            <select
              id="pawn-contract-status-filter"
              v-model="statusFilter"
              class="form-select"
            >
              <option value="all">
                Semua status
              </option>
              <option
                v-for="status in contractStatusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-2 d-flex align-items-end">
            <button
              class="btn btn-outline-secondary w-100 pawn-contract-page__reset-button"
              type="button"
              :disabled="!hasActiveFilters"
              @click="resetFilters()"
            >
              <i
                class="bi bi-arrow-counterclockwise"
                aria-hidden="true"
              />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="activeIndexTab === 'nasabah_akad'"
      class="card border-0 shadow-sm"
    >
      <div class="card-body p-4">
        <div class="pawn-contract-page__section-eyebrow">
          Nasabah Akad
        </div>
        <h2 class="pawn-contract-page__section-title mb-1">
          Daftar akad aktif
        </h2>
        <div class="pawn-contract-page__tabs mt-4">
          <button
            v-for="tab in nasabahTabs"
            :key="tab.key"
            class="pawn-contract-page__tab"
            :class="{ 'is-active': activeNasabahTab === tab.key }"
            type="button"
            @click="setActiveNasabahTab(tab.key)"
          >
            {{ tab.label }} <strong>{{ formatCount(tab.count) }}</strong>
          </button>
        </div>

        <div
          v-if="activeNasabahTab === 'seluruh_data'"
          class="pawn-contract-page__totals pawn-contract-page__totals--overview mt-4"
        >
          <div class="pawn-contract-page__total-item">
            <span>Total Pinjaman Seluruh Data</span>
            <strong>{{ formatCurrency(activeNasabahSection.totals.principalAmount) }}</strong>
          </div>
          <div class="pawn-contract-page__total-item">
            <span>Total Tunggakan Seluruh Data</span>
            <strong>{{ formatCurrency(activeNasabahSection.totals.arrearsAmount) }}</strong>
          </div>
          <div class="pawn-contract-page__total-item">
            <span>Total Tunggakan Hari Ini</span>
            <strong>{{ formatCurrency(activeNasabahSection.totals.dueTodayAmount) }}</strong>
          </div>
        </div>

        <div class="d-grid gap-4 mt-4">
          <article
            v-for="section in displayedNasabahSections"
            :key="section.key"
            class="pawn-contract-page__panel"
          >
            <div class="pawn-contract-page__panel-header mb-3">
              <div class="pawn-contract-page__panel-copy">
                <h3 class="pawn-contract-page__table-title mb-1">
                  {{ section.label }}
                </h3>
                <p class="text-secondary mb-0">
                  {{ section.description }}
                </p>
              </div>
              <div class="pawn-contract-page__panel-count text-secondary small">
                {{ formatCount(section.rows.length) }} akad
              </div>
            </div>

            <div
              v-if="section.rows.length > 0"
              class="pawn-contract-page__table-wrap"
            >
              <table class="table align-middle pawn-contract-page__table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>No. Telp</th>
                    <th>ID</th>
                    <th>Jaminan</th>
                    <th>Pinjaman</th>
                    <th>Tunggakan</th>
                    <th>Tanggal Akad</th>
                    <th>Jatuh Tempo</th>
                    <th>Prosedur</th>
                    <th class="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in section.rows"
                    :key="`${section.key}-${row.contract.id}`"
                  >
                    <td>
                      <div class="fw-semibold">
                        {{ row.customerName }}
                      </div>
                      <div class="text-secondary small">
                        {{ row.branchName }}
                      </div>
                    </td>
                    <td>{{ row.customerPhone }}</td>
                    <td>{{ row.customerIdentity }}</td>
                    <td>{{ row.itemNames }}</td>
                    <td>{{ formatCurrency(row.contract.disbursedValue) }}</td>
                    <td>
                      <div class="fw-semibold">
                        {{ formatCurrency(row.arrears.overdueAmount) }}
                      </div>
                      <div class="text-secondary small">
                        Hari ini: {{ formatCurrency(row.arrears.dueTodayAmount) }}
                      </div>
                    </td>
                    <td>{{ formatDate(row.contract.contractDate) }}</td>
                    <td>
                      <div>{{ formatDate(row.contract.maturityDate) }}</div>
                      <span
                        class="status-badge mt-1"
                        :class="getDueStateClass(row.dueState)"
                      >
                        {{ row.dueLabel }}
                      </span>
                    </td>
                    <td>
                      <div class="pawn-contract-page__chips">
                        <span
                          v-for="procedure in row.procedureTags"
                          :key="procedure"
                          class="procedure-chip"
                        >
                          {{ procedure }}
                        </span>
                      </div>
                    </td>
                    <td class="text-end">
                      <RouterLink
                        class="btn btn-sm btn-outline-dark"
                        :to="{ name: 'PawnContractFormEdit', params: { contractId: row.contract.id } }"
                      >
                        Ubah
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-else
              class="pawn-contract-page__empty-state"
            >
              Tidak ada data akad untuk section ini.
            </div>

            <div class="pawn-contract-page__totals">
              <div class="pawn-contract-page__total-item">
                <span>Total Pinjaman</span>
                <strong>{{ formatCurrency(section.totals.principalAmount) }}</strong>
              </div>
              <div class="pawn-contract-page__total-item">
                <span>Total Tunggakan</span>
                <strong>{{ formatCurrency(section.totals.arrearsAmount) }}</strong>
              </div>
              <div class="pawn-contract-page__total-item">
                <span>Total Tunggakan Hari Ini</span>
                <strong>{{ formatCurrency(section.totals.dueTodayAmount) }}</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section
      v-else-if="activeIndexTab === 'ringkasan_harian'"
      class="d-grid gap-4"
    >
      <section class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="pawn-contract-page__section-eyebrow">
            Ringkasan Harian
          </div>
          <h2 class="pawn-contract-page__section-title mb-1">
            Aktivitas hari ini
          </h2>
          <div class="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-3 mt-3">
            <article class="col">
              <div class="pawn-contract-page__metric-card">
                <span>Akad Baru</span><strong>{{ formatCurrency(ringkasanMetrics.akadBaru) }}</strong>
              </div>
            </article>
            <article class="col">
              <div class="pawn-contract-page__metric-card">
                <span>Akad Ulang</span><strong>{{ formatCurrency(ringkasanMetrics.akadUlang) }}</strong>
              </div>
            </article>
            <article class="col">
              <div class="pawn-contract-page__metric-card">
                <span>Total Realisasi</span><strong>{{ formatCurrency(ringkasanMetrics.totalRealisasi) }}</strong>
              </div>
            </article>
            <article class="col">
              <div class="pawn-contract-page__metric-card">
                <span>Pendapatan B. Titip</span><strong>{{ formatCurrency(ringkasanMetrics.pendapatanBtitip) }}</strong>
              </div>
            </article>
            <article class="col">
              <div class="pawn-contract-page__metric-card">
                <span>Pendapatan B. Admin</span><strong>{{ formatCurrency(ringkasanMetrics.pendapatanBadmin) }}</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="row g-4">
        <div
          v-for="section in ringkasanSections"
          :key="section.key"
          class="col-12 col-xl-6"
        >
          <article class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h3 class="pawn-contract-page__table-title mb-1">
                {{ section.label }}
              </h3>
              <p class="text-secondary mb-3">
                {{ section.description }}
              </p>
              <div
                v-if="section.rows.length > 0"
                class="pawn-contract-page__table-wrap"
              >
                <table class="table align-middle pawn-contract-page__table pawn-contract-page__table--compact">
                  <thead><tr><th>No. Akad</th><th>Nasabah</th><th>Jaminan</th><th>Pinjaman</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr
                      v-for="row in section.rows"
                      :key="`${section.key}-${row.contract.id}`"
                    >
                      <td>{{ row.contract.contractNumber }}</td>
                      <td>{{ row.customerName }}</td>
                      <td>{{ row.itemNames }}</td>
                      <td>{{ formatCurrency(row.contract.disbursedValue) }}</td>
                      <td>
                        <span
                          class="status-badge"
                          :class="getContractStatusClass(row.contract.contractStatus)"
                        >{{ getContractStatusLabel(row.contract.contractStatus) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                v-else
                class="pawn-contract-page__empty-state"
              >
                Belum ada data pada kategori ini hari ini.
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h3 class="pawn-contract-page__table-title mb-1">
            Data Pendapatan
          </h3>
          <div
            v-if="ringkasanPendapatanRows.length > 0"
            class="pawn-contract-page__table-wrap mt-3"
          >
            <table class="table align-middle pawn-contract-page__table pawn-contract-page__table--compact">
              <thead><tr><th>No. Akad</th><th>Nasabah</th><th>Cabang</th><th>B. Titip</th><th>B. Admin</th><th>Total</th></tr></thead>
              <tbody>
                <tr
                  v-for="row in ringkasanPendapatanRows"
                  :key="`pendapatan-${row.contractId}`"
                >
                  <td>{{ row.contractNumber }}</td>
                  <td>{{ row.customerName }}</td>
                  <td>{{ row.branchName }}</td>
                  <td>{{ formatCurrency(row.storageFeeAmount) }}</td>
                  <td>{{ formatCurrency(row.administrationFeeAmount) }}</td>
                  <td>{{ formatCurrency(row.totalIncome) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else
            class="pawn-contract-page__empty-state mt-3"
          >
            Belum ada pendapatan yang tercatat hari ini.
          </div>
        </div>
      </section>
    </section>

    <section
      v-else-if="activeIndexTab === 'akad_jatuh_tempo'"
      class="card border-0 shadow-sm"
    >
      <div class="card-body p-4">
        <div class="pawn-contract-page__section-eyebrow">
          Akad Jatuh Tempo
        </div>
        <h2 class="pawn-contract-page__section-title mb-1">
          Pilihan jenis jatuh tempo
        </h2>
        <div class="pawn-contract-page__tabs mt-4">
          <button
            v-for="option in ajtOptions"
            :key="option.key"
            class="pawn-contract-page__tab"
            :class="{ 'is-active': activeAjtType === option.key }"
            type="button"
            @click="setActiveAjtType(option.key)"
          >
            {{ option.label }} <strong>{{ formatCount(option.count) }}</strong>
          </button>
        </div>
        <div
          v-if="ajtRows.length > 0"
          class="pawn-contract-page__table-wrap mt-4"
        >
          <table class="table align-middle pawn-contract-page__table">
            <thead>
              <tr>
                <th>No. Akad</th><th>Nasabah</th><th>Jaminan</th><th>Jatuh Tempo</th><th>Tenor</th><th>Status</th><th class="text-end">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in ajtRows"
                :key="`ajt-${row.contract.id}`"
              >
                <td>{{ row.contract.contractNumber }}</td>
                <td>{{ row.customerName }}</td>
                <td>{{ row.itemNames }}</td>
                <td>
                  <div>{{ formatDate(row.contract.maturityDate) }}</div>
                  <span
                    class="status-badge mt-1"
                    :class="getDueStateClass(row.dueState)"
                  >{{ row.dueLabel }}</span>
                </td>
                <td>{{ getTermLabel(row.contract.termDays) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="getContractStatusClass(row.contract.contractStatus)"
                  >{{ getContractStatusLabel(row.contract.contractStatus) }}</span>
                </td>
                <td class="text-end">
                  <RouterLink
                    class="btn btn-sm btn-outline-dark"
                    :to="{ name: 'PawnContractFormEdit', params: { contractId: row.contract.id } }"
                  >
                    Ubah
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="pawn-contract-page__empty-state mt-4"
        >
          Tidak ada akad untuk kategori jatuh tempo ini.
        </div>
      </div>
    </section>

    <section
      v-else-if="activeIndexTab === 'pelunasan_lelang'"
      class="card border-0 shadow-sm"
    >
      <div class="card-body p-4">
        <div class="pawn-contract-page__section-eyebrow">
          Pelunasan dan Lelang
        </div>
        <h2 class="pawn-contract-page__section-title mb-1">
          Data lunas, lelang, dan refund
        </h2>
        <div class="pawn-contract-page__tabs mt-4">
          <button
            v-for="option in settlementOptions"
            :key="option.key"
            class="pawn-contract-page__tab"
            :class="{ 'is-active': activeSettlementType === option.key }"
            type="button"
            @click="setActiveSettlementType(option.key)"
          >
            {{ option.label }} <strong>{{ formatCount(option.count) }}</strong>
          </button>
        </div>
        <div
          v-if="settlementRows.length > 0"
          class="pawn-contract-page__table-wrap mt-4"
        >
          <table class="table align-middle pawn-contract-page__table">
            <thead><tr><th>No. Akad</th><th>Nasabah</th><th>Jaminan</th><th>Tanggal</th><th>Nilai</th><th>Status</th></tr></thead>
            <tbody>
              <tr
                v-for="row in settlementRows"
                :key="`settlement-${row.contract.id}`"
              >
                <td>{{ row.contract.contractNumber }}</td>
                <td>{{ row.customerName }}</td>
                <td>{{ row.itemNames }}</td>
                <td>{{ formatDate(row.contract.updatedAt?.slice(0, 10) ?? row.contract.maturityDate) }}</td>
                <td>{{ formatCurrency(row.contract.disbursedValue) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="getContractStatusClass(row.contract.contractStatus)"
                  >{{ getContractStatusLabel(row.contract.contractStatus) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="pawn-contract-page__empty-state mt-4"
        >
          Belum ada kontrak pada kategori ini.
        </div>
      </div>
    </section>

    <section
      v-else-if="activeIndexTab === 'lokasi_distribusi'"
      class="card border-0 shadow-sm"
    >
      <div class="card-body p-4">
        <div class="pawn-contract-page__section-eyebrow">
          Lokasi / Distribusi
        </div>
        <h2 class="pawn-contract-page__section-title mb-1">
          Mutasi lokasi barang jaminan
        </h2>
        <div class="pawn-contract-page__tabs mt-4">
          <button
            v-for="option in locationOptions"
            :key="option.key"
            class="pawn-contract-page__tab"
            :class="{ 'is-active': activeLocationTab === option.key }"
            type="button"
            @click="setActiveLocationTab(option.key)"
          >
            {{ option.label }} <strong>{{ formatCount(option.count) }}</strong>
          </button>
        </div>
        <div
          v-if="locationRows.length > 0"
          class="pawn-contract-page__table-wrap mt-4"
        >
          <table class="table align-middle pawn-contract-page__table">
            <thead><tr><th>No</th><th>Nama Barang</th><th>Nasabah</th><th>Cabang</th><th>Lokasi</th><th>Action</th><th>Print</th></tr></thead>
            <tbody>
              <tr
                v-for="(row, index) in locationRows"
                :key="`location-${row.itemId}`"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="fw-semibold">
                    {{ row.itemName }}
                  </div><div class="text-secondary small">
                    {{ row.contractNumber }}
                  </div>
                </td>
                <td>{{ row.customerName }}</td>
                <td>{{ row.branchName }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="getLocationStatusClass(row.currentLocationStatus)"
                  >{{ row.currentLocationLabel }}</span>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      class="btn btn-sm btn-outline-dark"
                      type="button"
                    >
                      {{ row.primaryActionLabel }}
                    </button>
                    <button
                      v-if="row.secondaryActionLabel"
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                    >
                      {{ row.secondaryActionLabel }}
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    type="button"
                  >
                    Print
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="pawn-contract-page__empty-state mt-4"
        >
          Tidak ada barang untuk kategori lokasi ini.
        </div>
      </div>
    </section>

    <section
      v-else-if="activeIndexTab === 'maintenance'"
      class="card border-0 shadow-sm"
    >
      <div class="card-body p-4">
        <div class="pawn-contract-page__section-eyebrow">
          Maintenance
        </div>
        <h2 class="pawn-contract-page__section-title mb-1">
          Window maintenance operasional
        </h2>
        <div
          v-if="maintenanceRows.length > 0"
          class="pawn-contract-page__table-wrap mt-4"
        >
          <table class="table align-middle pawn-contract-page__table">
            <thead><tr><th>ID</th><th>Nama Nasabah</th><th>Nama Barang</th><th>Tanggal Akad</th><th>Ceklis</th><th>Print</th></tr></thead>
            <tbody>
              <tr
                v-for="row in maintenanceRows"
                :key="`maintenance-${row.contractId}`"
              >
                <td>{{ row.contractId }}</td>
                <td>{{ row.customerName }}</td>
                <td>{{ row.itemNames }}</td>
                <td>{{ formatDate(row.contractDate) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="row.maintenanceRequired ? 'status-badge--warning' : 'status-badge--success'"
                  >{{ row.checklistLabel }}</span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    type="button"
                  >
                    Print
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="pawn-contract-page__empty-state mt-4"
        >
          Belum ada akad yang masuk window maintenance.
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

import '../styles/pawn_contract.css';
import { pawnContractViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

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
  nasabahTabs,
  activeNasabahSection,
  displayedNasabahSections,
  ringkasanSections,
  ringkasanPendapatanRows,
  ringkasanMetrics,
  ajtOptions,
  ajtRows,
  settlementOptions,
  settlementRows,
  locationOptions,
  locationRows,
  maintenanceRows,
  hasActiveFilters
} = storeToRefs(vm);

const contractStatusOptions = vm.contractStatusOptions;

const activeIndexTabMeta = computed(() => {
  const currentTab = indexTabs.value.find((tab) => tab.key === activeIndexTab.value);

  return {
    label: currentTab?.label ?? 'Index Akad',
    description:
      currentTab?.description ??
      'Pantau data akad gadai secara terpusat dengan filter cabang dan status kontrak.'
  };
});

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

onMounted(() => {
  void vm.getPawnContractData();
});
</script>
