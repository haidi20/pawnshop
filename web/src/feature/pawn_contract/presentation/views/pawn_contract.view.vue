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
              <span class="pawn-contract-page__tab-label">{{ tab.label }}</span>
              <strong class="pawn-contract-page__tab-count">{{ formatCount(tab.count) }}</strong>
            </button>
          </div>
        </div>

        <div class="pawn-contract-page__overview-body mt-3">
          <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
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
        </div>

        <div class="pawn-contract-page__content">
          <section
            v-if="activeIndexTab === 'nasabah_akad'"
            class="pawn-contract-page__content-section"
          >
            <div class="pawn-contract-page__section-eyebrow">
              Nasabah Akad
            </div>
            <h2 class="pawn-contract-page__section-title mb-1">
              Daftar akad aktif
            </h2>
            <div class="pawn-contract-page__tabs mt-3">
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
              class="pawn-contract-page__totals pawn-contract-page__totals--overview mt-3"
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

            <div class="d-grid gap-3 mt-3">
              <article
                v-for="sectionTable in displayedNasabahSectionTables"
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
                    {{ formatCount(sectionTable.rows.length) }} akad
                  </div>
                </div>

                <DataTableClientSideComponent
                  :vm="sectionTable.vm"
                  class="pawn-contract-page__datatable"
                >
                  <template #extra-actions>
                    <button
                      class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
                      :class="{ 'is-active': hasActiveFilters }"
                      type="button"
                      @click="openFilterModal()"
                    >
                      <i
                        class="bi bi-sliders"
                        aria-hidden="true"
                      />
                      <span>Filter akad</span>
                    </button>
                  </template>
                  <template #body="{ item }">
                    <tr>
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
                        data-label="Tanggal Akad"
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
                      <td
                        class="pawn-contract-page__cell-action text-end"
                        data-label="Aksi"
                      >
                        <button
                          class="btn btn-sm btn-outline-dark pawn-contract-page__action-button"
                          type="button"
                          @click="openActionModal(item.source)"
                        >
                          Aksi
                        </button>
                      </td>
                    </tr>
                  </template>
                  <template #empty>
                    <div class="pawn-contract-page__empty-state">
                      Tidak ada data akad untuk section ini.
                    </div>
                  </template>
                </DataTableClientSideComponent>

                <div class="pawn-contract-page__totals">
                  <div class="pawn-contract-page__total-item">
                    <span>Total Pinjaman</span>
                    <strong>{{ formatCurrency(sectionTable.totals.principalAmount) }}</strong>
                  </div>
                  <div class="pawn-contract-page__total-item">
                    <span>Total Tunggakan</span>
                    <strong>{{ formatCurrency(sectionTable.totals.arrearsAmount) }}</strong>
                  </div>
                  <div class="pawn-contract-page__total-item">
                    <span>Total Tunggakan Hari Ini</span>
                    <strong>{{ formatCurrency(sectionTable.totals.dueTodayAmount) }}</strong>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section
            v-else-if="activeIndexTab === 'ringkasan_harian'"
            class="pawn-contract-page__content-stack"
          >
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
                    <span>Pendapatan B. Titip</span><strong>{{ formatCurrency(ringkasanMetrics.pendapatanBtitip)
                    }}</strong>
                  </div>
                </article>
                <article class="col">
                  <div class="pawn-contract-page__metric-card">
                    <span>Pendapatan B. Admin</span><strong>{{ formatCurrency(ringkasanMetrics.pendapatanBadmin)
                    }}</strong>
                  </div>
                </article>
              </div>
            </section>

            <section class="row g-3">
              <div
                v-for="sectionTable in ringkasanSectionTables"
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
                        @click="openFilterModal()"
                      >
                        <i
                          class="bi bi-sliders"
                          aria-hidden="true"
                        />
                        <span>Filter akad</span>
                      </button>
                    </template>
                    <template #body="{ item }">
                      <tr>
                        <td data-label="No. Akad">
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
                      <div class="pawn-contract-page__empty-state">
                        Belum ada data pada kategori ini hari ini.
                      </div>
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
                :vm="ringkasanPendapatanTableVm"
                class="mt-3 pawn-contract-page__datatable"
              >
                <template #extra-actions>
                  <button
                    class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
                    :class="{ 'is-active': hasActiveFilters }"
                    type="button"
                    @click="openFilterModal()"
                  >
                    <i
                      class="bi bi-sliders"
                      aria-hidden="true"
                    />
                    <span>Filter akad</span>
                  </button>
                </template>
                <template #empty>
                  <div class="pawn-contract-page__empty-state mt-3">
                    Belum ada pendapatan yang tercatat hari ini.
                  </div>
                </template>
              </DataTableClientSideComponent>
            </section>
          </section>

          <section
            v-else-if="activeIndexTab === 'akad_jatuh_tempo'"
            class="pawn-contract-page__content-section"
          >
            <div class="pawn-contract-page__section-eyebrow">
              Akad Jatuh Tempo
            </div>
            <h2 class="pawn-contract-page__section-title mb-1">
              Pilihan jenis jatuh tempo
            </h2>
            <div class="pawn-contract-page__tabs mt-3">
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
            <DataTableClientSideComponent
              :vm="ajtDataTableVm"
              class="mt-3 pawn-contract-page__datatable"
            >
              <template #extra-actions>
                <button
                  class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
                  :class="{ 'is-active': hasActiveFilters }"
                  type="button"
                  @click="openFilterModal()"
                >
                  <i
                    class="bi bi-sliders"
                    aria-hidden="true"
                  />
                  <span>Filter akad</span>
                </button>
              </template>
              <template #body="{ item }">
                <tr>
                  <td data-label="No. Akad">
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
                  <td
                    class="pawn-contract-page__cell-action text-end"
                    data-label="Aksi"
                  >
                    <RouterLink
                      class="btn btn-sm btn-outline-dark pawn-contract-page__action-button"
                      :to="{
                        name: 'PawnContractFormEdit',
                        params: { contractId: item.source.contract.id },
                      }"
                    >
                      Ubah
                    </RouterLink>
                  </td>
                </tr>
              </template>
              <template #empty>
                <div class="pawn-contract-page__empty-state mt-3">
                  Tidak ada akad untuk kategori jatuh tempo ini.
                </div>
              </template>
            </DataTableClientSideComponent>
          </section>

          <section
            v-else-if="activeIndexTab === 'pelunasan_lelang'"
            class="pawn-contract-page__content-section"
          >
            <div class="pawn-contract-page__section-eyebrow">
              Pelunasan dan Lelang
            </div>
            <h2 class="pawn-contract-page__section-title mb-1">
              Data lunas, lelang, dan refund
            </h2>
            <div class="pawn-contract-page__tabs mt-3">
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
            <DataTableClientSideComponent
              :vm="settlementDataTableVm"
              class="mt-3 pawn-contract-page__datatable"
            >
              <template #extra-actions>
                <button
                  class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
                  :class="{ 'is-active': hasActiveFilters }"
                  type="button"
                  @click="openFilterModal()"
                >
                  <i
                    class="bi bi-sliders"
                    aria-hidden="true"
                  />
                  <span>Filter akad</span>
                </button>
              </template>
              <template #body="{ item }">
                <tr>
                  <td data-label="No. Akad">
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

          <section
            v-else-if="activeIndexTab === 'lokasi_distribusi'"
            class="pawn-contract-page__content-section"
          >
            <div class="pawn-contract-page__section-eyebrow">
              Lokasi / Distribusi
            </div>
            <h2 class="pawn-contract-page__section-title mb-1">
              Mutasi lokasi barang jaminan
            </h2>
            <div class="pawn-contract-page__tabs mt-3">
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
            <DataTableClientSideComponent
              :vm="locationDataTableVm"
              class="mt-3 pawn-contract-page__datatable"
            >
              <template #extra-actions>
                <button
                  class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
                  :class="{ 'is-active': hasActiveFilters }"
                  type="button"
                  @click="openFilterModal()"
                >
                  <i
                    class="bi bi-sliders"
                    aria-hidden="true"
                  />
                  <span>Filter akad</span>
                </button>
              </template>
              <template #body="{ item, index }">
                <tr>
                  <td data-label="No">
                    {{ locationDataTableVm.offset + index + 1 }}
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

          <section
            v-else-if="activeIndexTab === 'maintenance'"
            class="pawn-contract-page__content-section"
          >
            <div class="pawn-contract-page__section-eyebrow">
              Maintenance
            </div>
            <h2 class="pawn-contract-page__section-title mb-1">
              Window maintenance operasional
            </h2>
            <DataTableClientSideComponent
              :vm="maintenanceDataTableVm"
              class="mt-3 pawn-contract-page__datatable"
            >
              <template #extra-actions>
                <button
                  class="btn btn-outline-secondary pawn-contract-page__table-filter-button"
                  :class="{ 'is-active': hasActiveFilters }"
                  type="button"
                  @click="openFilterModal()"
                >
                  <i
                    class="bi bi-sliders"
                    aria-hidden="true"
                  />
                  <span>Filter akad</span>
                </button>
              </template>
              <template #body="{ item }">
                <tr>
                  <td data-label="ID">
                    {{ item.source.contractId }}
                  </td>
                  <td data-label="Nama Nasabah">
                    {{ item.source.customerName }}
                  </td>
                  <td data-label="Nama Barang">
                    {{ item.source.itemNames }}
                  </td>
                  <td data-label="Tanggal Akad">
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
                  Belum ada akad yang masuk window maintenance.
                </div>
              </template>
            </DataTableClientSideComponent>
          </section>
        </div>
      </div>
    </section>

    <PawnContractActionModalComponent
      :row="selectedActionRow"
      @close="closeActionModal()"
    />

    <section
      v-if="isFilterModalOpen"
      class="modal fade show d-block pawn-contract-page__filter-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pawn-contract-filter-modal-title"
    >
      <div class="modal-dialog modal-dialog-centered pawn-contract-page__filter-dialog">
        <div class="modal-content border-0 pawn-contract-page__filter-content">
          <div class="modal-header pawn-contract-page__filter-header">
            <div>
              <div class="pawn-contract-page__section-eyebrow mb-2">
                Filter Tabel
              </div>
              <h2
                id="pawn-contract-filter-modal-title"
                class="h5 mb-1"
              >
                Filter index akad
              </h2>
              <p class="mb-0 text-secondary">
                Pilih cabang dan status kontrak untuk mempersempit data pada tabel.
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeFilterModal()"
            />
          </div>

          <div class="modal-body pawn-contract-page__filter-body">
            <div class="row g-3">
              <div class="col-12">
                <label
                  class="form-label fw-semibold"
                  for="pawn-contract-table-branch-filter"
                >Cabang</label>
                <select
                  id="pawn-contract-table-branch-filter"
                  v-model="draftBranchFilter"
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

              <div class="col-12">
                <label
                  class="form-label fw-semibold"
                  for="pawn-contract-table-status-filter"
                >Status kontrak</label>
                <select
                  id="pawn-contract-table-status-filter"
                  v-model="draftStatusFilter"
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
            </div>
          </div>

          <div class="modal-footer pawn-contract-page__filter-footer">
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="closeFilterModal()"
            >
              Tutup
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="!hasActiveFilters && draftBranchFilter === 'all' && draftStatusFilter === 'all'"
              @click="resetFilterModal()"
            >
              Reset
            </button>
            <button
              class="btn btn-primary"
              type="button"
              @click="applyFilterModal()"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </section>
    <div
      v-if="isFilterModalOpen"
      class="modal-backdrop fade show pawn-contract-page__filter-backdrop"
      @click="closeFilterModal()"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import type { PawnContractStatusModel } from '@core/util/helpers';
import '../styles/pawn_contract.css';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';
import PawnContractActionModalComponent from '@feature/pawn_contract/presentation/components/pawn_contract_action_modal.component.vue';
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
  hasActiveFilters,
} = storeToRefs(vm);

const contractStatusOptions = vm.contractStatusOptions;
const isFilterModalOpen = ref(false);
const selectedActionRow = ref<PawnContractSummaryModel | null>(null);
const draftBranchFilter = ref('all');
const draftStatusFilter = ref<'all' | PawnContractStatusModel>('all');

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
  setActiveLocationTab,
} = vm;

const getProcessStatusClass = (label: string): string => {
  switch (label) {
    case 'Data Baru':
    case 'Perpanjangan':
      return 'status-badge--accent';
    case 'Bayar B. Titip':
      return 'status-badge--warning';
    case 'Pelunasan':
      return 'status-badge--success';
    case 'Lelang':
      return 'status-badge--danger';
    default:
      return 'status-badge--neutral';
  }
};

const openActionModal = (row: PawnContractSummaryModel): void => {
  selectedActionRow.value = row;
};

const closeActionModal = (): void => {
  selectedActionRow.value = null;
};

const openFilterModal = (): void => {
  draftBranchFilter.value = branchFilter.value;
  draftStatusFilter.value = statusFilter.value;
  isFilterModalOpen.value = true;
};

const closeFilterModal = (): void => {
  isFilterModalOpen.value = false;
};

const applyFilterModal = (): void => {
  branchFilter.value = draftBranchFilter.value;
  statusFilter.value = draftStatusFilter.value;
  closeFilterModal();
};

const resetFilterModal = (): void => {
  draftBranchFilter.value = 'all';
  draftStatusFilter.value = 'all';
  resetFilters();
  closeFilterModal();
};

onMounted(() => {
  void vm.getPawnContractData();
});
</script>
