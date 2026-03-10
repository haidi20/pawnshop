import type { DashboardDataModel } from '@feature/dashboard/domain/models';
import type { DashboardRepository } from '@feature/dashboard/domain/repositories/dashboard_repository';

export class GetDashboardDataUsecase {
    constructor(private readonly repository: DashboardRepository) {}

    async execute(): Promise<DashboardDataModel> {
        return this.repository.getData();
    }
}
