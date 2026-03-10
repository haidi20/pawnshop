import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface InvestorsRow {
    id: number;
    investor_code: string;
    full_name: string;
    phone_number: string | null;
    address: string | null;
    is_active: number;
    created_at: string | null;
    updated_at: string | null;
}

export const investorsTable = createFeatureDbTable<InvestorsRow>({
    featureKey: 'master-investor',
    tableName: 'investors',
    collectionName: 'investors',
    primaryKey: 'id',
    seedPath: '/dummies/investors.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'investor_code', dataType: 'string', nullable: false, sqlType: 'VARCHAR(50)' },
        { name: 'full_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(150)' },
        { name: 'phone_number', dataType: 'string', nullable: true, sqlType: 'VARCHAR(30)' },
        { name: 'address', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'is_active', dataType: 'number', nullable: false, sqlType: 'TINYINT(1)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
