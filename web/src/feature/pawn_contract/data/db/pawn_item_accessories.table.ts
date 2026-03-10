import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface PawnItemAccessoriesRow {
    id: number;
    pawn_item_id: number;
    accessory_name: string;
    accessory_condition: string | null;
    notes: string | null;
    sort_order: number;
    created_at: string | null;
    updated_at: string | null;
}

export const pawnItemAccessoriesTable = createFeatureDbTable<PawnItemAccessoriesRow>({
    featureKey: 'pawn-contract',
    tableName: 'pawn_item_accessories',
    collectionName: 'pawn_item_accessories',
    primaryKey: 'id',
    seedPath: '/dummies/pawn_item_accessories.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'pawn_item_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'accessory_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'accessory_condition', dataType: 'string', nullable: true, sqlType: 'VARCHAR(255)' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'sort_order', dataType: 'number', nullable: false, sqlType: 'SMALLINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
