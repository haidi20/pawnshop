import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface AuthPortalSessionsRow {
    id: number;
    company_id: number;
    user_id: number;
    session_token: string;
    login_at: string;
    logout_at: string | null;
    session_status: string;
    created_at: string | null;
    updated_at: string | null;
}

export const authPortalSessionsTable = createFeatureDbTable<AuthPortalSessionsRow>({
    featureKey: 'auth-portal',
    tableName: 'auth_portal_sessions',
    collectionName: 'auth_portal_sessions',
    primaryKey: 'id',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'user_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'session_token', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'login_at', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'logout_at', dataType: 'datetime', nullable: true, sqlType: 'DATETIME' },
        { name: 'session_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'active\', \'closed\')', enumValues: ['active', 'closed'] },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' }
    ]
});
