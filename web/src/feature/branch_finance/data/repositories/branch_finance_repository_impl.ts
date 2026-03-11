import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { branchCashAccountsDao, branchCashTransactionsDao, branchDebtsDao, branchDebtPaymentsDao, interBranchTransfersDao } from '@feature/branch_finance/data/db';
import { BranchFinanceLocalDatasource } from '@feature/branch_finance/data/datasources/branch_finance_local_datasource';
import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';
import type { BranchFinanceRepository } from '@feature/branch_finance/domain/repositories/branch_finance.repository';

export class BranchFinanceRepositoryImpl implements BranchFinanceRepository {
    constructor(private readonly localDataSource: BranchFinanceLocalDatasource) {}

    async getData(): Promise<Either<Error, BranchFinanceDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('BranchFinanceRepositoryImpl', [
                branchCashAccountsDao,
                branchCashTransactionsDao,
                branchDebtsDao,
                branchDebtPaymentsDao,
                interBranchTransfersDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
