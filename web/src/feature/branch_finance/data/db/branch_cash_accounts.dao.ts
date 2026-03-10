import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchCashAccountsTable, type BranchCashAccountsRow } from '@feature/branch_finance/data/db/branch_cash_accounts.table';

export class BranchCashAccountsDao extends FeatureTableDao<BranchCashAccountsRow> {
    constructor() {
        super(branchCashAccountsTable);
    }
}

export const branchCashAccountsDao = new BranchCashAccountsDao();
