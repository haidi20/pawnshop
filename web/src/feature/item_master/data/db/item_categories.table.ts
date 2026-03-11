import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface ItemCategoriesRow {
    id: number;
    company_id?: number | null;
    category_code: string;
    category_name: string;
    created_at: string | null;
    updated_at: string | null;
}

export const itemCategoriesTable = createFeatureDbTable<ItemCategoriesRow>({
    featureKey: 'item-master',
    tableName: 'item_categories',
    collectionName: 'item_categories',
    primaryKey: 'id',
    seedPath: '/dummies/item_categories.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'category_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'category_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
