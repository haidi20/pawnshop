import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchDebtPaymentsTable, type BranchDebtPaymentsRow } from '@feature/branch_finance/data/db/branch_debt_payments.table';

export class BranchDebtPaymentsDao extends FeatureTableDao<BranchDebtPaymentsRow> {
    constructor() {
        super(branchDebtPaymentsTable);
    }
}

export const branchDebtPaymentsDao = new BranchDebtPaymentsDao();
