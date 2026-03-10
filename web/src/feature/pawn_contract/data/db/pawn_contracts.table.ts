import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface PawnContractsRow {
    id: number;
    contract_number: string;
    branch_id: number;
    customer_id: number;
    contract_date: string;
    maturity_date: string;
    term_days: number;
    appraised_value: number;
    disbursed_value: number;
    storage_fee_amount: number;
    administration_fee_amount: number;
    payment_option_days: number | null;
    amount_in_words: string | null;
    contract_status: string;
    maintenance_required: number;
    maintenance_report: string | null;
    notes: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const pawnContractsTable = createFeatureDbTable<PawnContractsRow>({
    featureKey: 'pawn-contract',
    tableName: 'pawn_contracts',
    collectionName: 'pawn_contracts',
    primaryKey: 'id',
    seedPath: '/dummies/pawn_contracts.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_number', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'customer_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'maturity_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'term_days', dataType: 'number', nullable: false, sqlType: 'SMALLINT UNSIGNED' },
        { name: 'appraised_value', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'disbursed_value', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'storage_fee_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'administration_fee_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'payment_option_days', dataType: 'number', nullable: true, sqlType: 'SMALLINT UNSIGNED' },
        { name: 'amount_in_words', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'contract_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'draft\', \'active\', \'extended\', \'redeemed\', \'auctioned\', \'closed\', \'cancelled\')', enumValues: ['draft', 'active', 'extended', 'redeemed', 'auctioned', 'closed', 'cancelled'] },
        { name: 'maintenance_required', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'maintenance_report', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
