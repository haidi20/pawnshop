import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { interBranchTransfersTable, type InterBranchTransfersRow } from '@feature/branch_finance/data/db/inter_branch_transfers.table';

export class InterBranchTransfersDao extends FeatureTableDao<InterBranchTransfersRow> {
    constructor() {
        super(interBranchTransfersTable);
    }
}

export const interBranchTransfersDao = new InterBranchTransfersDao();
