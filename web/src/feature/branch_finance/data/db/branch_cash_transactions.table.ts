import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchCashTransactionsRow {
    id: number;
    branch_id: number;
    cash_account_id: number | null;
    transaction_type_code: string;
    reference_table: string | null;
    reference_id: number | null;
    entry_direction: string;
    amount: number;
    transaction_date: string;
    description: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const branchCashTransactionsTable = createFeatureDbTable<BranchCashTransactionsRow>({
    featureKey: 'branch-finance',
    tableName: 'branch_cash_transactions',
    collectionName: 'branch_cash_transactions',
    primaryKey: 'id',
    seedPath: '/dummies/branch_cash_transactions.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'cash_account_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'transaction_type_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'reference_table', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'reference_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'entry_direction', dataType: 'string', nullable: false, sqlType: 'ENUM(\'debit\', \'credit\')', enumValues: ['debit', 'credit'] },
        { name: 'amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'transaction_date', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'description', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
