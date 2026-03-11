import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface LoginSessionsRow {
    id: number;
    company_id?: number | null;
    user_id: number | null;
    session_token: string;
    ip_address: string | null;
    user_agent: string | null;
    login_at: string;
    logout_at: string | null;
    session_status: string;
    created_at: string | null;
    updated_at: string | null;
}

export const loginSessionsTable = createFeatureDbTable<LoginSessionsRow>({
    featureKey: 'auth-access',
    tableName: 'login_sessions',
    collectionName: 'login_sessions',
    primaryKey: 'id',
    seedPath: '/dummies/login_sessions.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'session_token', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'ip_address', dataType: 'string', nullable: true, sqlType: 'VARCHAR(45)' },
        { name: 'user_agent', dataType: 'string', nullable: true, sqlType: 'VARCHAR(255)' },
        { name: 'login_at', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'logout_at', dataType: 'datetime', nullable: true, sqlType: 'DATETIME' },
        { name: 'session_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'active\', \'closed\', \'expired\')', enumValues: ['active', 'closed', 'expired'] },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
