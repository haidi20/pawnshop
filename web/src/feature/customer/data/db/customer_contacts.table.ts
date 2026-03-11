import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface CustomerContactsRow {
    id: number;
    company_id?: number | null;
    customer_id: number;
    contact_type: string;
    contact_value: string;
    is_primary: number;
    created_at: string | null;
    updated_at: string | null;
}

export const customerContactsTable = createFeatureDbTable<CustomerContactsRow>({
    featureKey: 'customer',
    tableName: 'customer_contacts',
    collectionName: 'customer_contacts',
    primaryKey: 'id',
    seedPath: '/dummies/customer_contacts.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'customer_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contact_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'contact_value', dataType: 'string', nullable: false, sqlType: 'VARCHAR(150)' },
        { name: 'is_primary', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
