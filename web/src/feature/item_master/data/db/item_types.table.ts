import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface ItemTypesRow {
    id: number;
    category_id: number;
    type_code: string;
    type_name: string;
    created_at: string | null;
    updated_at: string | null;
}

export const itemTypesTable = createFeatureDbTable<ItemTypesRow>({
    featureKey: 'item-master',
    tableName: 'item_types',
    collectionName: 'item_types',
    primaryKey: 'id',
    seedPath: '/dummies/item_types.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'category_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'type_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'type_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
