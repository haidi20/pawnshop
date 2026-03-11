import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface RolesRow {
    id: number;
    company_id?: number | null;
    role_code: string;
    role_name: string;
    created_at: string | null;
    updated_at: string | null;
}

export const rolesTable = createFeatureDbTable<RolesRow>({
    featureKey: 'auth-access',
    tableName: 'roles',
    collectionName: 'roles',
    primaryKey: 'id',
    seedPath: '/dummies/roles.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'role_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'role_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
