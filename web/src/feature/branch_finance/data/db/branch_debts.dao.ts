import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchDebtsTable, type BranchDebtsRow } from '@feature/branch_finance/data/db/branch_debts.table';

export class BranchDebtsDao extends FeatureTableDao<BranchDebtsRow> {
    constructor() {
        super(branchDebtsTable);
    }
}

export const branchDebtsDao = new BranchDebtsDao();
