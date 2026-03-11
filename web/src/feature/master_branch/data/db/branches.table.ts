import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface BranchesRow {
    id: number;
    company_id?: number | null;
    branch_code: string;
    branch_number: string | null;
    branch_name: string;
    phone_number: string | null;
    address: string | null;
    is_active: number;
    created_at: string | null;
    updated_at: string | null;
}

export const branchesTable = createFeatureDbTable<BranchesRow>({
    featureKey: 'master-branch',
    tableName: 'branches',
    collectionName: 'branches',
    primaryKey: 'id',
    seedPath: '/dummies/branches.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'branch_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(50)' },
        { name: 'branch_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(150)' },
        { name: 'phone_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(30)' },
        { name: 'address', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'is_active', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
