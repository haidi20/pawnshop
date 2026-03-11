import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface AuthPortalCompaniesRow {
    id: number;
    company_id: number;
    name: string;
    legal_name: string | null;
    business_type: string | null;
    email: string | null;
    phone_number: string | null;
    city: string | null;
    address: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const authPortalCompaniesTable = createFeatureDbTable<AuthPortalCompaniesRow>({
    featureKey: 'auth-portal',
    tableName: 'auth_portal_companies',
    collectionName: 'auth_portal_companies',
    primaryKey: 'id',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(150)' },
        { name: 'legal_name', dataType: 'string', nullable: true, sqlType: 'VARCHAR(180)' },
        { name: 'business_type', dataType: 'string', nullable: true, sqlType: 'VARCHAR(120)' },
        { name: 'email', dataType: 'string', nullable: true, sqlType: 'VARCHAR(150)' },
        { name: 'phone_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(30)' },
        { name: 'city', dataType: 'string', nullable: true, sqlType: 'VARCHAR(120)' },
        { name: 'address', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' }
    ]
});
