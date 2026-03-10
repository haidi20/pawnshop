import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface UserRolesRow {
    user_id: number;
    role_id: number;
    created_at: string | null;
}

export const userRolesTable = createFeatureDbTable<UserRolesRow>({
    featureKey: 'auth-access',
    tableName: 'user_roles',
    collectionName: 'user_roles',
    primaryKey: ['user_id', 'role_id'],
    seedPath: '/dummies/user_roles.dummy.json',
    columns: [
        { name: 'user_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'role_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
