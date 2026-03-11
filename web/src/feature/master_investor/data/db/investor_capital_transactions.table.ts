import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface InvestorCapitalTransactionsRow {
    id: number;
    company_id?: number | null;
    investor_id: number;
    branch_id: number;
    transfer_id: number | null;
    transaction_type_code: string;
    transaction_date: string;
    amount: number;
    description: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const investorCapitalTransactionsTable = createFeatureDbTable<InvestorCapitalTransactionsRow>({
    featureKey: 'master-investor',
    tableName: 'investor_capital_transactions',
    collectionName: 'investor_capital_transactions',
    primaryKey: 'id',
    seedPath: '/dummies/investor_capital_transactions.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'investor_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'transfer_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'transaction_type_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'transaction_date', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'description', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
