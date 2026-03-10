<template>
  <section class="dashboard-page">
    <div class="dashboard-hero card">
      <div class="module-eyebrow text-white-50">Foundation Dashboard</div>
      <h1 class="dashboard-hero-title">Pawnshop feature workspace</h1>
      <p class="dashboard-hero-copy">
        Semua domain utama dari SQL sudah dipetakan ke feature terpisah.
        Dashboard ini menjadi pintu masuk untuk menavigasi modul operasional, kontrak,
        finansial, akses, dan support tanpa menunggu testing berjalan lebih dulu.
      </p>
    </div>

    <section v-if="isLoading" class="card p-4">
      <div class="d-flex align-items-center gap-3">
        <div class="spinner-border text-primary" role="status" aria-hidden="true" />
        <div>
          <div class="fw-bold">Loading dashboard</div>
          <div class="text-secondary">Menyiapkan seluruh modul dari blueprint SQL.</div>
        </div>
      </div>
    </section>

    <section v-else-if="error" class="card p-4">
      <div class="fw-bold text-danger mb-2">Dashboard failed to load</div>
      <p class="mb-3 text-secondary">{{ error }}</p>
      <button class="btn btn-primary" type="button" @click="vm.getDashboardData()">
        Muat ulang
      </button>
    </section>

    <template v-else-if="data">
      <div class="dashboard-kpi-grid">
        <article class="dashboard-kpi-card card">
          <div class="dashboard-kpi-label">Modules</div>
          <div class="dashboard-kpi-value">{{ data.totalModules }}</div>
        </article>
        <article class="dashboard-kpi-card card">
          <div class="dashboard-kpi-label">Primary Tables</div>
          <div class="dashboard-kpi-value">{{ data.totalPrimaryTables }}</div>
        </article>
        <article class="dashboard-kpi-card card">
          <div class="dashboard-kpi-label">Child Resources</div>
          <div class="dashboard-kpi-value">{{ data.totalChildResources }}</div>
        </article>
      </div>

      <div class="dashboard-module-grid">
        <RouterLink
          v-for="moduleItem in data.modules"
          :key="moduleItem.key"
          :to="moduleItem.route"
          class="dashboard-module-card card text-decoration-none text-reset"
        >
          <div class="dashboard-module-head">
            <div class="dashboard-module-icon">
              <i class="bi" :class="moduleItem.icon" />
            </div>
            <ModuleStatusBadge :status="moduleItem.status" />
          </div>

          <div class="module-eyebrow">{{ moduleItem.phase }}</div>
          <h2 class="dashboard-module-title">{{ moduleItem.title }}</h2>
          <p class="dashboard-module-summary">{{ moduleItem.summary }}</p>

          <ul class="dashboard-module-goals">
            <li v-for="goal in moduleItem.goals.slice(0, 2)" :key="goal">{{ goal }}</li>
          </ul>

          <div class="dashboard-module-foot">
            <div class="dashboard-module-meta">
              {{ moduleItem.entities.length }} entities ? {{ moduleItem.childResources.length }} child resources
            </div>
            <span class="btn btn-primary btn-sm">Open</span>
          </div>
        </RouterLink>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

import ModuleStatusBadge from '@core/presentation/components/module_status_badge.view.vue';
import { dashboardViewModel } from '@feature/dashboard/presentation/view_models/dashboard.vm';
import '@feature/dashboard/presentation/styles/dashboard_base.css';

const vm = dashboardViewModel();
const { data, isLoading, error } = storeToRefs(vm);

onMounted(() => {
    void vm.getDashboardData();
});
</script>
