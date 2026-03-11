import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface CustomersRow {
    id: number;
    company_id?: number | null;
    customer_code: string;
    full_name: string;
    gender: string;
    birth_date: string | null;
    city: string | null;
    address: string | null;
    customer_status: string;
    created_at: string | null;
    updated_at: string | null;
}

export const customersTable = createFeatureDbTable<CustomersRow>({
    featureKey: 'customer',
    tableName: 'customers',
    collectionName: 'customers',
    primaryKey: 'id',
    seedPath: '/dummies/customers.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'customer_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'full_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(150)' },
        { name: 'gender', dataType: 'string', nullable: false, sqlType: 'ENUM(\'male\', \'female\')', enumValues: ['male', 'female'] },
        { name: 'birth_date', dataType: 'date', nullable: true, sqlType: 'DATE' },
        { name: 'city', dataType: 'string', nullable: true, sqlType: 'VARCHAR(100)' },
        { name: 'address', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'customer_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'active\', \'inactive\', \'blocked\')', enumValues: ['active', 'inactive', 'blocked'] },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
