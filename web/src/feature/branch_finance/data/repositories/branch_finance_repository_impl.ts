import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { branchCashAccountsDao, branchCashTransactionsDao, branchDebtsDao, branchDebtPaymentsDao, interBranchTransfersDao } from '@feature/branch_finance/data/db';
import { BranchFinanceLocalDatasource } from '@feature/branch_finance/data/datasources/branch_finance_local_datasource';
import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';
import type { BranchFinanceRepository } from '@feature/branch_finance/domain/repositories/branch_finance.repository';

export class BranchFinanceRepositoryImpl implements BranchFinanceRepository {
    constructor(private readonly localDataSource: BranchFinanceLocalDatasource) {}

    async getData(): Promise<BranchFinanceDataModel> {
        await seedFeatureTablesIfEmpty('BranchFinanceRepositoryImpl', [
            branchCashAccountsDao,
            branchCashTransactionsDao,
            branchDebtsDao,
            branchDebtPaymentsDao,
            interBranchTransfersDao
        ]);

        return this.localDataSource.getData();
    }
}
