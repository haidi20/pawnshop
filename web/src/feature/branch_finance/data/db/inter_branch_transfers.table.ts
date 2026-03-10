import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface InterBranchTransfersRow {
    id: number;
    source_branch_id: number;
    target_branch_id: number;
    transfer_number: string;
    transfer_date: string;
    amount: number;
    transfer_status: string;
    description: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const interBranchTransfersTable = createFeatureDbTable<InterBranchTransfersRow>({
    featureKey: 'branch-finance',
    tableName: 'inter_branch_transfers',
    collectionName: 'inter_branch_transfers',
    primaryKey: 'id',
    seedPath: '/dummies/inter_branch_transfers.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'source_branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'target_branch_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'transfer_number', dataType: 'string', nullable: false, sqlType: 'VARCHAR(100)' },
        { name: 'transfer_date', dataType: 'datetime', nullable: false, sqlType: 'DATETIME' },
        { name: 'amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'transfer_status', dataType: 'string', nullable: false, sqlType: 'ENUM(\'draft\', \'sent\', \'received\', \'cancelled\')', enumValues: ['draft', 'sent', 'received', 'cancelled'] },
        { name: 'description', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
