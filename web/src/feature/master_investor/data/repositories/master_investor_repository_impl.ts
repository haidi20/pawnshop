import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { investorsDao, branchInvestorsDao, investorCapitalTransactionsDao } from '@feature/master_investor/data/db';
import { MasterInvestorLocalDatasource } from '@feature/master_investor/data/datasources/master_investor_local_datasource';
import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';
import type { MasterInvestorRepository } from '@feature/master_investor/domain/repositories/master_investor.repository';

export class MasterInvestorRepositoryImpl implements MasterInvestorRepository {
    constructor(private readonly localDataSource: MasterInvestorLocalDatasource) {}

    async getData(): Promise<Either<Error, MasterInvestorDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('MasterInvestorRepositoryImpl', [
                investorsDao,
                branchInvestorsDao,
                investorCapitalTransactionsDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
