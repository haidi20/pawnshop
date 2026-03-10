import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { investorsDao, branchInvestorsDao, investorCapitalTransactionsDao } from '@feature/master_investor/data/db';
import { MasterInvestorLocalDatasource } from '@feature/master_investor/data/datasources/master_investor_local_datasource';
import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';
import type { MasterInvestorRepository } from '@feature/master_investor/domain/repositories/master_investor.repository';

export class MasterInvestorRepositoryImpl implements MasterInvestorRepository {
    constructor(private readonly localDataSource: MasterInvestorLocalDatasource) {}

    async getData(): Promise<MasterInvestorDataModel> {
        await seedFeatureTablesIfEmpty('MasterInvestorRepositoryImpl', [
            investorsDao,
            branchInvestorsDao,
            investorCapitalTransactionsDao
        ]);

        return this.localDataSource.getData();
    }
}
