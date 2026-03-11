import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { DashboardDataModel } from '@feature/dashboard/domain/models';
import type { DashboardRepository } from '@feature/dashboard/domain/repositories/dashboard_repository';

export class GetDashboardDataUsecase {
    constructor(private readonly repository: DashboardRepository) {}

    async execute(): Promise<Either<Error, DashboardDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
