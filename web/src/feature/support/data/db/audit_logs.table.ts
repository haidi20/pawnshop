import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface AuditLogsRow {
    id: number;
    company_id?: number | null;
    user_id: number | null;
    entity_type: string;
    entity_id: number | null;
    action_type: string;
    ip_address: string | null;
    action_at: string;
    summary: string | null;
    metadata_json: Record<string, unknown> | null;
    created_at: string | null;
}

export const auditLogsTable = createFeatureDbTable<AuditLogsRow>({
    featureKey: 'support',
    tableName: 'audit_logs',
    collectionName: 'audit_logs',
    primaryKey: 'id',
    seedPath: '/dummies/audit_logs.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'entity_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'entity_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'action_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'ip_address', dataType: 'string', nullable: true, sqlType: 'VARCHAR(45)' },
        { name: 'action_at', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'summary', dataType: 'string', nullable: true, sqlType: 'VARCHAR(255)' },
        { name: 'metadata_json', dataType: 'json', nullable: true, sqlType: 'JSON' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
