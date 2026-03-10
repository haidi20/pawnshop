import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchesTable, type BranchesRow } from '@feature/master_branch/data/db/branches.table';

export class BranchesDao extends FeatureTableDao<BranchesRow> {
    constructor() {
        super(branchesTable);
    }
}

export const branchesDao = new BranchesDao();
