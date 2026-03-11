import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchDebtPaymentsRow {
    id: number;
    company_id?: number | null;
    debt_id: number;
    payment_date: string;
    amount: number;
    notes: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const branchDebtPaymentsTable = createFeatureDbTable<BranchDebtPaymentsRow>({
    featureKey: 'branch-finance',
    tableName: 'branch_debt_payments',
    collectionName: 'branch_debt_payments',
    primaryKey: 'id',
    seedPath: '/dummies/branch_debt_payments.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'debt_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'payment_date', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
