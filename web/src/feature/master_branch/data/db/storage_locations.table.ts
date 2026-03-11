import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface StorageLocationsRow {
    id: number;
    company_id?: number | null;
    branch_id: number | null;
    location_code: string;
    location_name: string;
    location_type: string;
    is_active: number;
    created_at: string | null;
    updated_at: string | null;
}

export const storageLocationsTable = createFeatureDbTable<StorageLocationsRow>({
    featureKey: 'master-branch',
    tableName: 'storage_locations',
    collectionName: 'storage_locations',
    primaryKey: 'id',
    seedPath: '/dummies/storage_locations.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'location_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'location_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'location_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'is_active', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
