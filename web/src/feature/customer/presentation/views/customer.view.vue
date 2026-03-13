<template>
  <LocalDbFeedbackStateComponent v-if="isLoading" state="loading" title="Memuat data customer"
    description="Mengambil data customer perusahaan aktif dari database lokal."
    note="Tampilan akan diisi setelah VM menerima hasil pembacaan DAO lokal." />

  <LocalDbFeedbackStateComponent v-else-if="error" state="error" title="Gagal memuat data customer" :description="error"
    note="Coba muat ulang pembacaan DB lokal agar daftar customer diperbarui." action-label="Muat ulang"
    @action="vm.getCustomerData()" />

  <LocalDbFeedbackStateComponent v-else-if="data && data.totalRows === 0" state="empty" title="Belum ada data customer"
    description="Database lokal perusahaan aktif belum memiliki baris customer untuk ditampilkan."
    note="Kondisi ini normal untuk perusahaan baru atau setelah data dibersihkan." />

  <section v-else-if="data" class="feature-data-page">
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

      <article v-for="metric in data.tableCounts.slice(0, 3)" :key="metric.key" class="metric-card card col h-100">
        <div class="metric-label">
          {{ metric.label }}
        </div>
        <div class="metric-value">
          {{ metric.count }}
        </div>
        <div class="metric-note">
          Data untuk tabel {{ metric.key }}.
        </div>
      </article>
    </div>

    <section class="feature-data-page__tables">
      <article v-for="table in featureTables" :key="table.entity.key" class="feature-data-page__table-section">
        <div
          class="feature-data-page__table-head d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3">
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
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import { useFeatureTableSections } from '@core/presentation/composables/use_feature_table_sections';
import '@core/presentation/styles/feature_data_tables.css';
import { customerViewModel } from '@feature/customer/presentation/view_models/customer.vm';

const vm = customerViewModel();
const { data, isLoading, error } = storeToRefs(vm);
const featureTables = useFeatureTableSections(data);

onMounted(() => {
  void vm.getCustomerData();
});
</script>
