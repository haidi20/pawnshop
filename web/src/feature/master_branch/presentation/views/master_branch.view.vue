<template>
  <LocalDbFeedbackStateComponent
    v-if="isLoading"
    state="loading"
    title="Memuat master cabang"
    description="Mengambil data cabang dan lokasi penyimpanan dari database lokal."
    note="Daftar cabang aktif akan muncul setelah pembacaan tabel lokal selesai."
  />

  <LocalDbFeedbackStateComponent
    v-else-if="error"
    state="error"
    title="Gagal memuat master cabang"
    :description="error"
    note="Coba muat ulang agar data cabang dari DB lokal dibaca kembali."
    action-label="Muat ulang"
    @action="vm.getMasterBranchData()"
  />

  <LocalDbFeedbackStateComponent
    v-else-if="data && data.totalRows === 0"
    state="empty"
    title="Belum ada master cabang"
    description="Database lokal perusahaan aktif belum memiliki data cabang untuk digunakan."
    note="Pemilihan cabang user dan filter operasional baru tersedia setelah data ini ada."
  />

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
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import { useFeatureTableSections } from '@core/presentation/composables/use_feature_table_sections';
import '@core/presentation/styles/feature_data_tables.css';
import { masterBranchViewModel } from '@feature/master_branch/presentation/view_models/master_branch.vm';

const vm = masterBranchViewModel();
const { data, isLoading, error } = storeToRefs(vm);
const featureTables = useFeatureTableSections(data);

onMounted(() => {
    void vm.getMasterBranchData();
});
</script>

