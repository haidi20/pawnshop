<template>
  <section class="feature-data-page">
    <div class="module-stats-grid">
      <article class="metric-card card">
        <div class="metric-label">Total Rows</div>
        <div class="metric-value">{{ data.totalRows }}</div>
        <div class="metric-note">Seluruh row lokal yang dimuat oleh feature ini.</div>
      </article>

      <article
        v-for="metric in data.tableCounts.slice(0, 3)"
        :key="metric.key"
        class="metric-card card"
      >
        <div class="metric-label">{{ metric.label }}</div>
        <div class="metric-value">{{ metric.count }}</div>
        <div class="metric-note">Data lokal untuk tabel {{ metric.key }}.</div>
      </article>
    </div>

    <section class="feature-data-page__tables">
      <article
        v-for="table in featureTables"
        :key="table.entity.key"
        class="feature-data-page__table-section"
      >
        <div class="feature-data-page__table-head">
          <div>
            <div class="table-card-role">{{ table.entity.role }}</div>
            <h2 class="table-card-title">{{ table.entity.label }}</h2>
            <p class="table-card-description mb-0">{{ table.entity.description }}</p>
          </div>

          <div class="feature-data-page__table-meta">
            <code class="table-card-name">{{ table.entity.tableName }}</code>
            <span class="status-badge is-ready"> {{ table.rows.length }} rows </span>
          </div>
        </div>

        <DataTableClientSideComponent :vm="table.vm" />
      </article>
    </section>

    <ModulePage :module="data.module" />
  </section>
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue';

import type { AppModuleEntityBlueprint } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel } from '@core/domain/models/feature-module-data.model';
import DataTableClientSideComponent from '@core/presentation/components/datatable_clientside.component.vue';
import ModulePage from '@core/presentation/components/module_page.view.vue';
import { DataTableClientSideService } from '@core/presentation/services/datatable_clientside.service';

const props = defineProps<{
  data: FeatureModuleDataModel;
}>();

type TableRow = Record<string, unknown>;

interface FeatureTableSection {
  entity: AppModuleEntityBlueprint;
  rows: TableRow[];
  vm: DataTableClientSideService<TableRow>['vm'];
}

const TABLE_PROPERTY_ALIASES: Record<string, string[]> = {
  pawn_contracts: ['contracts'],
  pawn_items: ['items'],
  pawn_item_accessories: ['accessories'],
  pawn_item_issues: ['issues'],
  pawn_item_location_movements: ['locationMovements'],
};

const featureTables = shallowRef<FeatureTableSection[]>([]);

const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, character: string) => character.toUpperCase());

const toSentenceCase = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

const normalizeCellValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeCellValue(item)).join(', ');
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
};

const resolveSourceRows = (
  data: FeatureModuleDataModel,
  entity: AppModuleEntityBlueprint
): TableRow[] => {
  const record = data as Record<string, unknown>;
  const candidates = [
    entity.key,
    toCamelCase(entity.key),
    ...(TABLE_PROPERTY_ALIASES[entity.key] ?? []),
  ];

  for (const candidate of candidates) {
    const value = record[candidate];
    if (Array.isArray(value)) {
      return value as TableRow[];
    }
  }

  return [];
};

const buildRows = (rows: TableRow[], entity: AppModuleEntityBlueprint): TableRow[] =>
  rows.map((row, index) => {
    const normalizedRow: TableRow = {
      id: row.id ?? row.uuid ?? row.code ?? `${entity.key}-${index}`,
    };

    entity.columns.forEach((column) => {
      const propertyKey = toCamelCase(column);
      normalizedRow[propertyKey] = normalizeCellValue(row[propertyKey]);
    });

    return normalizedRow;
  });

const buildFeatureTables = (data: FeatureModuleDataModel): FeatureTableSection[] =>
  data.module.entities.map((entity) => {
    const rows = buildRows(resolveSourceRows(data, entity), entity);
    const fields = entity.columns.map((column) => ({
      key: toCamelCase(column),
      label: toSentenceCase(column),
    }));

    const service = new DataTableClientSideService<TableRow>(fields, rows);
    service.setItems(rows);

    return {
      entity,
      rows,
      vm: service.vm,
    };
  });

watch(
  () => props.data,
  (value) => {
    featureTables.value = buildFeatureTables(value);
  },
  { immediate: true }
);
</script>

<style scoped>
.feature-data-page {
  display: grid;
  gap: 24px;
}

.feature-data-page__tables {
  display: grid;
  gap: 24px;
}

.feature-data-page__table-section {
  display: grid;
  gap: 14px;
}

.feature-data-page__table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.feature-data-page__table-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 920px) {
  .feature-data-page__table-head {
    flex-direction: column;
  }

  .feature-data-page__table-meta {
    justify-content: flex-start;
  }
}
</style>
