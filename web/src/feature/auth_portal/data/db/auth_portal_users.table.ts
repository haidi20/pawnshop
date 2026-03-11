import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface AuthPortalUsersRow {
    id: number;
    company_id: number;
    role: string;
    assigned_branch_id: number | null;
    username: string;
    password_hash: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    is_active: number;
    created_at: string | null;
    updated_at: string | null;
}

export const authPortalUsersTable = createFeatureDbTable<AuthPortalUsersRow>({
    featureKey: 'auth-portal',
    tableName: 'auth_portal_users',
    collectionName: 'auth_portal_users',
    primaryKey: 'id',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'role', dataType: 'string', nullable: false, sqlType: 'ENUM(\'owner\', \'admin\', \'staff\')', enumValues: ['owner', 'admin', 'staff'] },
        { name: 'assigned_branch_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'username', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'password_hash', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'full_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(150)' },
        { name: 'email', dataType: 'string', nullable: true, sqlType: 'VARCHAR(150)' },
        { name: 'phone_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(30)' },
        { name: 'is_active', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' }
    ]
});
