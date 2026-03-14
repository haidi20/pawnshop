import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface AuctionTransactionsRow {
    id: number;
    company_id: number | null;
    contract_id: number;
    auction_date: string;
    overdue_amount: number;
    auction_sale_amount: number;
    auction_fee_amount: number;
    refund_amount: number;
    notes: string | null;
    created_by_user_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export const auctionTransactionsTable = createFeatureDbTable<AuctionTransactionsRow>({
    featureKey: 'pawn-transaction',
    tableName: 'auction_transactions',
    collectionName: 'auction_transactions',
    primaryKey: 'id',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'company_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'contract_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'auction_date', dataType: 'date', nullable: false, sqlType: 'DATE' },
        { name: 'overdue_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'auction_sale_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'auction_fee_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'refund_amount', dataType: 'number', nullable: false, sqlType: 'DECIMAL(18,2)' },
        { name: 'notes', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'created_by_user_id', dataType: 'number', nullable: true, sqlType: 'BIGINT UNSIGNED' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
