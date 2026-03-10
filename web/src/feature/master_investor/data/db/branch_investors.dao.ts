import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchInvestorsTable, type BranchInvestorsRow } from '@feature/master_investor/data/db/branch_investors.table';

export class BranchInvestorsDao extends FeatureTableDao<BranchInvestorsRow> {
    constructor() {
        super(branchInvestorsTable);
    }
}

export const branchInvestorsDao = new BranchInvestorsDao();
