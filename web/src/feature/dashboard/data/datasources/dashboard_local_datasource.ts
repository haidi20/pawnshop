import { dashboardModulesDao } from '@feature/dashboard/data/db';
import { createDashboardDataModel, type DashboardDataModel } from '@feature/dashboard/domain/models';

export class DashboardLocalDatasource {
    async getData(): Promise<DashboardDataModel> {
        return createDashboardDataModel(await dashboardModulesDao.getAll());
    }
}
