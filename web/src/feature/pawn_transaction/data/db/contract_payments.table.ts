import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface ContractPaymentsRow {
    id: number;
    company_id: number | null;
    contract_id: number;
    payment_type: string;
    payment_reference: string | null;
    amount: number;
    payment_date: string;
    notes: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const contractPaymentsTable = createFeatureDbTable<ContractPaymentsRow>({
    featureKey: 'pawn-transaction',
    tableName: 'contract_payments',
    collectionName: 'contract_payments',
    primaryKey: 'id',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'payment_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'payment_reference', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'payment_date', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
