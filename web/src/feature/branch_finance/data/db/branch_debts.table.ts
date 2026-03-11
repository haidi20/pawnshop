import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchDebtsRow {
    id: number;
    company_id?: number | null;
    branch_id: number;
    creditor_branch_id: number | null;
    debt_source_type: string;
    debt_reference_number: string | null;
    debt_date: string;
    principal_amount: number;
    outstanding_amount: number;
    due_date: string | null;
    debt_status: string;
    description: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const branchDebtsTable = createFeatureDbTable<BranchDebtsRow>({
    featureKey: 'branch-finance',
    tableName: 'branch_debts',
    collectionName: 'branch_debts',
    primaryKey: 'id',
    seedPath: '/dummies/branch_debts.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'creditor_branch_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'debt_source_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'debt_reference_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'debt_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'principal_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'outstanding_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'due_date', dataType: 'date', nullable: true, sqlType: 'DATE' },
        { name: 'debt_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'open\', \'partially_paid\', \'paid\', \'cancelled\')', enumValues: ['open', 'partially_paid', 'paid', 'cancelled'] },
        { name: 'description', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
