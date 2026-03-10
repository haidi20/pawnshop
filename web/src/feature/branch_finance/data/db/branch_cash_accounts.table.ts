import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchCashAccountsRow {
    id: number;
    branch_id: number;
    account_code: string;
    account_name: string;
    account_type: string;
    current_balance: number;
    is_active: number;
    created_at: string | null;
    updated_at: string | null;
}

export const branchCashAccountsTable = createFeatureDbTable<BranchCashAccountsRow>({
    featureKey: 'branch-finance',
    tableName: 'branch_cash_accounts',
    collectionName: 'branch_cash_accounts',
    primaryKey: 'id',
    seedPath: '/dummies/branch_cash_accounts.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'account_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'account_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'account_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'current_balance', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'is_active', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
