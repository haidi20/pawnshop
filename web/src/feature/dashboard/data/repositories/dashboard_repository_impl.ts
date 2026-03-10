import type { DashboardDataModel } from '@feature/dashboard/domain/models';
import type { DashboardRepository } from '@feature/dashboard/domain/repositories/dashboard_repository';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { dashboardModulesDao } from '@feature/dashboard/data/db';
import { DashboardLocalDatasource } from '@feature/dashboard/data/datasources/dashboard_local_datasource';

export class DashboardRepositoryImpl implements DashboardRepository {
    constructor(private readonly localDataSource: DashboardLocalDatasource) {}

    async getData(): Promise<DashboardDataModel> {
        await seedFeatureTablesIfEmpty('DashboardRepositoryImpl', [dashboardModulesDao]);
        return this.localDataSource.getData();
    }
}
