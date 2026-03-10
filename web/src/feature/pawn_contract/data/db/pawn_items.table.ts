import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';
import type { PawnItemLocationStatusModel } from '@core/util/helpers';
import type { PawnItemSpecificationModel } from '@feature/pawn_contract/domain/models';

export interface PawnItemsRow {
    id: number;
    contract_id: number;
    item_sequence: number;
    item_name: string;
    category_id: number | null;
    item_type_id: number | null;
    brand_name: string | null;
    model_name: string | null;
    serial_number: string | null;
    item_description: string | null;
    quantity: number;
    appraised_value: number;
    disbursed_value: number;
    condition_notes: string | null;
    missing_notes: string | null;
    specification_json: PawnItemSpecificationModel | null;
    current_location_id: number | null;
    current_location_status: PawnItemLocationStatusModel;
    created_at: string | null;
    updated_at: string | null;
}

export const pawnItemsTable = createFeatureDbTable<PawnItemsRow>({
    featureKey: 'pawn-contract',
    tableName: 'pawn_items',
    collectionName: 'pawn_items',
    primaryKey: 'id',
    seedPath: '/dummies/pawn_items.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'item_sequence', dataType: 'number', nullable: false, sqlType: 'SMALLINT UNSIGNED' },
        { name: 'item_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'category_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'item_type_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'brand_name', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'model_name', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'serial_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'item_description', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'quantity', dataType: 'number', nullable: false, sqlType: 'INT UNSIGNED' },
        { name: 'appraised_value', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'disbursed_value', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'condition_notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'missing_notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'specification_json', dataType: 'json', nullable: true, sqlType: 'JSON' },
        { name: 'current_location_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'current_location_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'in_office\', \'in_warehouse\', \'released\', \'auctioned\', \'returned\', \'other\')', enumValues: ['in_office', 'in_warehouse', 'released', 'auctioned', 'returned', 'other'] },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
