import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchInvestorsRow {
    id: number;
    company_id?: number | null;
    branch_id: number;
    investor_id: number;
    ownership_percentage: number | null;
    start_date: string;
    end_date: string | null;
    is_primary: number;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const branchInvestorsTable = createFeatureDbTable<BranchInvestorsRow>({
    featureKey: 'master-investor',
    tableName: 'branch_investors',
    collectionName: 'branch_investors',
    primaryKey: 'id',
    seedPath: '/dummies/branch_investors.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'investor_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'ownership_percentage', dataType: 'number', nullable: true, sqlType: 'DECIMAL(5,2)' },
        { name: 'start_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'end_date', dataType: 'date', nullable: true, sqlType: 'DATE' },
        { name: 'is_primary', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
