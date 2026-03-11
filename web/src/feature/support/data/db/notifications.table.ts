import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface NotificationsRow {
    id: number;
    company_id?: number | null;
    branch_id: number | null;
    customer_id: number | null;
    contract_id: number | null;
    notification_type: string;
    message: string;
    is_read: number;
    read_at: string | null;
    read_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const notificationsTable = createFeatureDbTable<NotificationsRow>({
    featureKey: 'support',
    tableName: 'notifications',
    collectionName: 'notifications',
    primaryKey: 'id',
    seedPath: '/dummies/notifications.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'branch_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'customer_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'notification_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'message', dataType: 'string', nullable: false, sqlType: 'TEXT' },
        { name: 'is_read', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'read_at', dataType: 'datetime', nullable: true, sqlType: 'DATETIME' },
        { name: 'read_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
