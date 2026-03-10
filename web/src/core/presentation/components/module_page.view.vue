<template>
  <section class="module-page">
    <div class="module-hero card">
      <div class="module-hero-copy">
        <div class="module-eyebrow">{{ module.phase }}</div>
        <h1 class="module-title">{{ module.title }}</h1>
        <p class="module-summary">{{ module.summary }}</p>
      </div>
      <div class="module-hero-meta">
        <ModuleStatusBadge :status="module.status" />
        <div class="module-route">{{ module.route }}</div>
      </div>
    </div>

    <div class="module-stats-grid">
      <article class="metric-card card">
        <div class="metric-label">Primary Tables</div>
        <div class="metric-value">{{ primaryTableCount }}</div>
        <div class="metric-note">Tabel inti yang menjadi entry point feature.</div>
      </article>
      <article class="metric-card card">
        <div class="metric-label">Child Resources</div>
        <div class="metric-value">{{ module.childResources.length }}</div>
        <div class="metric-note">Sub resource yang muncul sebagai section atau sub form.</div>
      </article>
      <article class="metric-card card">
        <div class="metric-label">Tracked Entities</div>
        <div class="metric-value">{{ module.entities.length }}</div>
        <div class="metric-note">Entitas yang sudah dipetakan dari SQL ke feature.</div>
      </article>
    </div>

    <div class="module-grid">
      <article class="module-panel card">
        <div class="panel-title">Goals</div>
        <ul class="panel-list">
          <li v-for="goal in module.goals" :key="goal">{{ goal }}</li>
        </ul>
      </article>

      <article class="module-panel card">
        <div class="panel-title">Next Steps</div>
        <ul class="panel-list">
          <li v-for="step in module.nextSteps" :key="step">{{ step }}</li>
        </ul>
      </article>
    </div>

    <div class="module-tables">
      <article
        v-for="entity in module.entities"
        :key="entity.key"
        class="table-card card"
      >
        <div class="table-card-head">
          <div>
            <div class="table-card-role">{{ entity.role }}</div>
            <h2 class="table-card-title">{{ entity.label }}</h2>
          </div>
          <code class="table-card-name">{{ entity.tableName }}</code>
        </div>
        <p class="table-card-description">{{ entity.description }}</p>
        <div class="table-columns">
          <span
            v-for="column in entity.columns"
            :key="column"
            class="column-chip"
          >
            {{ column }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import ModuleStatusBadge from '@core/presentation/components/module_status_badge.view.vue';

const props = defineProps<{
  module: AppModuleSummary;
}>();

const primaryTableCount = computed(() =>
  props.module.entities.filter((entity) => entity.role === 'primary').length
);
</script>
