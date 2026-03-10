import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface UsersRow {
    id: number;
    username: string;
    password_hash: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    remember_token: string | null;
    is_active: number;
    created_at: string | null;
    updated_at: string | null;
}

export const usersTable = createFeatureDbTable<UsersRow>({
    featureKey: 'auth-access',
    tableName: 'users',
    collectionName: 'users',
    primaryKey: 'id',
    seedPath: '/dummies/users.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'username', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'password_hash', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'full_name', dataType: 'string', nullable: true, sqlType: 'VARCHAR(150)' },
        { name: 'email', dataType: 'string', nullable: true, sqlType: 'VARCHAR(150)' },
        { name: 'phone_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(30)' },
        { name: 'remember_token', dataType: 'string', nullable: true, sqlType: 'VARCHAR(255)' },
        { name: 'is_active', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
