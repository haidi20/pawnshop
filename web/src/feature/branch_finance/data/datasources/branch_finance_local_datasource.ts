import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { branchCashAccountsDao, branchCashTransactionsDao, branchDebtsDao, branchDebtPaymentsDao, interBranchTransfersDao } from '@feature/branch_finance/data/db';
import { createBranchFinanceDataFromRows } from '@feature/branch_finance/data/mappers/branch_finance.mapper';
import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';

export class BranchFinanceLocalDatasource {
    async getData(): Promise<BranchFinanceDataModel> {
        const [
            branchCashAccountsRows,
            branchCashTransactionsRows,
            branchDebtsRows,
            branchDebtPaymentsRows,
            interBranchTransfersRows
        ] = await Promise.all([
            branchCashAccountsDao.getAll(),
            branchCashTransactionsDao.getAll(),
            branchDebtsDao.getAll(),
            branchDebtPaymentsDao.getAll(),
            interBranchTransfersDao.getAll()
        ]);

        return createBranchFinanceDataFromRows({
            module: getAppModuleByKey('branch-finance'),
            branchCashAccountsRows,
            branchCashTransactionsRows,
            branchDebtsRows,
            branchDebtPaymentsRows,
            interBranchTransfersRows,
        });
    }
}
