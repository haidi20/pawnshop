import { computed, type ComputedRef, type Ref } from 'vue';

import type { AppModuleEntityBlueprint } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel } from '@core/domain/models/feature-module-data.model';
import { DataTableClientSideService } from '@core/presentation/services/datatable_clientside.service';

type TableRow = Record<string, unknown>;

export interface FeatureTableSection {
    entity: AppModuleEntityBlueprint;
    rows: TableRow[];
    vm: DataTableClientSideService<TableRow>['vm'];
}

const TABLE_PROPERTY_ALIASES: Record<string, string[]> = {
    pawn_contracts: ['contracts'],
    pawn_items: ['items'],
    pawn_item_accessories: ['accessories'],
    pawn_item_issues: ['issues'],
    pawn_item_location_movements: ['locationMovements']
};

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
        ...(TABLE_PROPERTY_ALIASES[entity.key] ?? [])
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
            id: row.id ?? row.uuid ?? row.code ?? `${entity.key}-${index}`
        };

        entity.columns.forEach((column) => {
            const propertyKey = toCamelCase(column);
            normalizedRow[propertyKey] = normalizeCellValue(row[propertyKey]);
        });

        return normalizedRow;
    });

export const createFeatureTableSections = (data: FeatureModuleDataModel): FeatureTableSection[] =>
    data.module.entities.map((entity) => {
        const rows = buildRows(resolveSourceRows(data, entity), entity);
        const fields = entity.columns.map((column) => ({
            key: toCamelCase(column),
            label: toSentenceCase(column)
        }));

        const service = new DataTableClientSideService<TableRow>(fields, rows);
        service.setItems(rows);

        return {
            entity,
            rows,
            vm: service.vm
        };
    });

export const useFeatureTableSections = <T extends FeatureModuleDataModel>(
    data: Ref<T | null> | ComputedRef<T | null>
) =>
    computed<FeatureTableSection[]>(() => {
        if (!data.value) {
            return [];
        }

        return createFeatureTableSections(data.value);
    });
