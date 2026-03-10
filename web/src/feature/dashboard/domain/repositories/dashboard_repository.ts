import type { DashboardDataModel } from '@feature/dashboard/domain/models';

export interface DashboardRepository {
    getData(): Promise<DashboardDataModel>;
}
