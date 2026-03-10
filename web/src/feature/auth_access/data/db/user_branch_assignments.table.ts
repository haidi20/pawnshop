import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface UserBranchAssignmentsRow {
    id: number;
    user_id: number;
    branch_id: number;
    is_primary: number;
    assigned_at: string;
    unassigned_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const userBranchAssignmentsTable = createFeatureDbTable<UserBranchAssignmentsRow>({
    featureKey: 'auth-access',
    tableName: 'user_branch_assignments',
    collectionName: 'user_branch_assignments',
    primaryKey: 'id',
    seedPath: '/dummies/user_branch_assignments.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'user_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'is_primary', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'assigned_at', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'unassigned_at', dataType: 'datetime', nullable: true, sqlType: 'DATETIME' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
