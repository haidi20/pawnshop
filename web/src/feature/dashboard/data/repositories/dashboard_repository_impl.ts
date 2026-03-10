import type { DashboardDataModel } from '@feature/dashboard/domain/models';
import type { DashboardRepository } from '@feature/dashboard/domain/repositories/dashboard_repository';
import { DashboardLocalDatasource } from '@feature/dashboard/data/datasources/dashboard_local_datasource';

export class DashboardRepositoryImpl implements DashboardRepository {
    constructor(private readonly localDataSource: DashboardLocalDatasource) {}

    async getData(): Promise<DashboardDataModel> {
        return this.localDataSource.getData();
    }
}
