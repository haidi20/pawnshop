import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface SettingRow {
    key: string;
    value: string;
}

export const settingTable = createFeatureDbTable<SettingRow>({
    featureKey: 'core',
    tableName: 'setting',
    collectionName: 'setting',
    primaryKey: 'key',
    columns: [
        { name: 'key', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'value', dataType: 'string', nullable: false, sqlType: 'TEXT' }
    ]
});
