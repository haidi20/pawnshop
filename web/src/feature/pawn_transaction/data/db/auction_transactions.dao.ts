import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { auctionTransactionsTable, type AuctionTransactionsRow } from '@feature/pawn_transaction/data/db/auction_transactions.table';

export class AuctionTransactionsDao extends FeatureTableDao<AuctionTransactionsRow> {
    constructor() {
        super(auctionTransactionsTable);
    }
}

export const auctionTransactionsDao = new AuctionTransactionsDao();
