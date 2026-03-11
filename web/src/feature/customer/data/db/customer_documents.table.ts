import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface CustomerDocumentsRow {
    id: number;
    company_id?: number | null;
    customer_id: number;
    document_type: string;
    document_number: string;
    is_primary: number;
    issued_date: string | null;
    expired_date: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const customerDocumentsTable = createFeatureDbTable<CustomerDocumentsRow>({
    featureKey: 'customer',
    tableName: 'customer_documents',
    collectionName: 'customer_documents',
    primaryKey: 'id',
    seedPath: '/dummies/customer_documents.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'customer_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'document_type', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'document_number', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'is_primary', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'issued_date', dataType: 'date', nullable: true, sqlType: 'DATE' },
        { name: 'expired_date', dataType: 'date', nullable: true, sqlType: 'DATE' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
