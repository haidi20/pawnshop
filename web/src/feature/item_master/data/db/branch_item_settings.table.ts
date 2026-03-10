import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchItemSettingsRow {
    id: number;
    branch_id: number;
    item_type_id: number;
    margin_rate: number;
    deduction_rate: number;
    effective_from: string;
    effective_until: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const branchItemSettingsTable = createFeatureDbTable<BranchItemSettingsRow>({
    featureKey: 'item-master',
    tableName: 'branch_item_settings',
    collectionName: 'branch_item_settings',
    primaryKey: 'id',
    seedPath: '/dummies/branch_item_settings.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'item_type_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'margin_rate', dataType: 'number', nullable: false, sqlType: 'DECIMAL(5,2)' },
        { name: 'deduction_rate', dataType: 'number', nullable: false, sqlType: 'DECIMAL(5,2)' },
        { name: 'effective_from', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'effective_until', dataType: 'date', nullable: true, sqlType: 'DATE' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
