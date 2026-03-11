import { left, right, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { DashboardDataModel } from '@feature/dashboard/domain/models';
import type { DashboardRepository } from '@feature/dashboard/domain/repositories/dashboard_repository';
import { DashboardLocalDatasource } from '@feature/dashboard/data/datasources/dashboard_local_datasource';

export class DashboardRepositoryImpl implements DashboardRepository {
    constructor(private readonly localDataSource: DashboardLocalDatasource) {}

    async getData(): Promise<Either<Error, DashboardDataModel>> {
        try {
            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
