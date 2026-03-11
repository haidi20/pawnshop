import type { Either } from 'fp-ts/Either';
import type { DashboardDataModel } from '@feature/dashboard/domain/models';

export interface DashboardRepository {
    getData(): Promise<Either<Error, DashboardDataModel>>;
}
