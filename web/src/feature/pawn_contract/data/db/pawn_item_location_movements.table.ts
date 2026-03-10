import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface PawnItemLocationMovementsRow {
    id: number;
    pawn_item_id: number;
    from_location_id: number | null;
    to_location_id: number | null;
    from_status: string | null;
    to_status: string | null;
    moved_at: string;
    moved_by_user_id: number | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const pawnItemLocationMovementsTable = createFeatureDbTable<PawnItemLocationMovementsRow>({
    featureKey: 'pawn-contract',
    tableName: 'pawn_item_location_movements',
    collectionName: 'pawn_item_location_movements',
    primaryKey: 'id',
    seedPath: '/dummies/pawn_item_location_movements.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'pawn_item_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'from_location_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'to_location_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'from_status', dataType: 'string', nullable: true, sqlType: 'VARCHAR(50)' },
        { name: 'to_status', dataType: 'string', nullable: true, sqlType: 'VARCHAR(50)' },
        { name: 'moved_at', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'moved_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
