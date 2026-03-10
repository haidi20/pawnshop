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
          Loading Pawn Contract
        </div>
        <div class="text-secondary">
          Menyiapkan struktur feature berdasarkan SQL.
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
      @click="vm.loadData()"
    >
      Muat ulang
    </button>
  </section>

  <section
    v-else-if="data"
    class="feature-data-page"
  >
    <div class="module-stats-grid row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
      <article class="metric-card card col h-100">
        <div class="metric-label">
          Total Rows
        </div>
        <div class="metric-value">
          {{ data.totalRows }}
        </div>
        <div class="metric-note">
          Seluruh row lokal yang dimuat oleh feature ini.
        </div>
      </article>

      <article
        v-for="metric in data.tableCounts.slice(0, 3)"
        :key="metric.key"
        class="metric-card card col h-100"
      >
        <div class="metric-label">
          {{ metric.label }}
        </div>
        <div class="metric-value">
          {{ metric.count }}
        </div>
        <div class="metric-note">
          Data lokal untuk tabel {{ metric.key }}.
        </div>
      </article>
    </div>

    <section class="feature-data-page__tables">
      <article
        v-for="table in featureTables"
        :key="table.entity.key"
        class="feature-data-page__table-section"
      >
        <div class="feature-data-page__table-head d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3">
          <div>
            <div class="table-card-role">
              {{ table.entity.role }}
            </div>
            <h2 class="table-card-title">
              {{ table.entity.label }}
            </h2>
            <p class="table-card-description mb-0">
              {{ table.entity.description }}
            </p>
          </div>

          <div class="feature-data-page__table-meta d-flex flex-wrap gap-2 align-items-center">
            <code class="table-card-name">{{ table.entity.tableName }}</code>
            <span class="status-badge is-ready">{{ table.rows.length }} rows</span>
          </div>
        </div>

        <DataTableClientSideComponent :vm="table.vm" />
      </article>
    </section>

    <ModulePage :module="data.module" />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import ModulePage from '@core/presentation/components/module_page.view.vue';
import { useFeatureTableSections } from '@core/presentation/composables/use_feature_table_sections';
import '@core/presentation/styles/feature_data_tables.css';
import { pawnContractViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

const vm = pawnContractViewModel();
const { data, isLoading, error } = storeToRefs(vm);
const featureTables = useFeatureTableSections(data);

onMounted(() => {
  void vm.loadData();
});
</script>

