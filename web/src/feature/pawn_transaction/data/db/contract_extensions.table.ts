import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface ContractExtensionsRow {
    id: number;
    company_id?: number | null;
    contract_id: number;
    extension_date: string;
    previous_maturity_date: string;
    new_maturity_date: string;
    extension_term_days: number;
    extension_fee_amount: number;
    notes: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const contractExtensionsTable = createFeatureDbTable<ContractExtensionsRow>({
    featureKey: 'pawn-transaction',
    tableName: 'contract_extensions',
    collectionName: 'contract_extensions',
    primaryKey: 'id',
    seedPath: '/dummies/contract_extensions.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'extension_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'previous_maturity_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'new_maturity_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'extension_term_days', dataType: 'number', nullable: false, sqlType: 'SMALLINT UNSIGNED' },
        { name: 'extension_fee_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
