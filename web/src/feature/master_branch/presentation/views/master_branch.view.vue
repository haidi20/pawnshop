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
    <div class="module-stats-grid row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
      <article class="metric-card card col h-100">
        <div class="metric-label">
          Total Cabang
        </div>
        <div class="metric-value">
          {{ totalBranchCount }}
        </div>
        <div class="metric-note">
          Seluruh cabang yang tersimpan pada database lokal perusahaan aktif.
        </div>
      </article>

      <article class="metric-card card col h-100">
        <div class="metric-label">
          Total Cabang Aktif
        </div>
        <div class="metric-value">
          {{ activeBranchCount }}
        </div>
        <div class="metric-note">
          Cabang yang siap dipakai untuk operasional dan assignment user.
        </div>
      </article>

      <article class="metric-card card col h-100">
        <div class="metric-label">
          Total Cabang Belum Aktif
        </div>
        <div class="metric-value">
          {{ inactiveBranchCount }}
        </div>
        <div class="metric-note">
          Cabang yang masih tersimpan tetapi belum diaktifkan untuk operasional.
        </div>
      </article>
    </div>

    <section class="feature-data-page__tables">
      <article
        v-for="table in featureTables"
        :key="table.entity.key"
        :id="getFeatureSectionId(table.entity.key)"
        class="feature-data-page__table-section"
      >
        <div class="feature-data-page__table-head d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3">
          <div>
            <div class="table-card-role">
              {{ getEntityRoleLabel(table.entity.role) }}
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
            <span class="status-badge is-ready">{{ table.rows.length }} baris</span>
          </div>
        </div>

        <DataTableClientSideComponent :vm="table.vm" />
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import { useFeatureTableSections } from '@core/presentation/composables/use_feature_table_sections';
import '@core/presentation/styles/feature_data_tables.css';
import { masterBranchViewModel } from '@feature/master_branch/presentation/view_models/master_branch.vm';
import type { AppModuleEntityRole } from '@core/domain/interfaces/app_module.interface';

const vm = masterBranchViewModel();
const route = useRoute();
const { data, isLoading, error } = storeToRefs(vm);
const featureTables = useFeatureTableSections(data);
const totalBranchCount = computed(() => data.value?.branches.length ?? 0);
const activeBranchCount = computed(() => data.value?.branches.filter((branch) => branch.isActive).length ?? 0);
const inactiveBranchCount = computed(() => totalBranchCount.value - activeBranchCount.value);

const getFeatureSectionId = (entityKey: string): string | undefined => {
    switch (entityKey) {
        case 'branches':
            return 'data-cabang';
        case 'storage_locations':
            return 'lokasi-penyimpanan';
        default:
            return undefined;
    }
};

const getEntityRoleLabel = (role: AppModuleEntityRole): string => {
    switch (role) {
        case 'primary':
            return 'Utama';
        case 'child':
            return 'Turunan';
        default:
            return 'Pendukung';
    }
};

const scrollToHashSection = async (hash: string): Promise<void> => {
    if (typeof document === 'undefined' || !hash) {
        return;
    }

    await nextTick();

    const targetElement = document.getElementById(hash.replace(/^#/, ''));
    targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

watch(
    () => route.hash,
    (hash) => {
        void scrollToHashSection(hash);
    },
    { immediate: true }
);

onMounted(() => {
    void vm.getMasterBranchData();
});
</script>

