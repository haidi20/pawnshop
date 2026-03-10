import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchCashTransactionsTable, type BranchCashTransactionsRow } from '@feature/branch_finance/data/db/branch_cash_transactions.table';

export class BranchCashTransactionsDao extends FeatureTableDao<BranchCashTransactionsRow> {
    constructor() {
        super(branchCashTransactionsTable);
    }
}

export const branchCashTransactionsDao = new BranchCashTransactionsDao();
