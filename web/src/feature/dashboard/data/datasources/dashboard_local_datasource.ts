import { dashboardPawnTransactionDao } from '@feature/dashboard/data/db';
import { createDashboardDataModel, type DashboardDataModel } from '@feature/dashboard/domain/models';

export class DashboardLocalDatasource {
    async getData(): Promise<DashboardDataModel> {
        const snapshot = await dashboardPawnTransactionDao.getSnapshot(10, 5);

        return createDashboardDataModel({
            chartItems: snapshot.chartItems,
            lineSeries: snapshot.lineSeries,
            recentTransactions: snapshot.recentTransactions,
            contractCount: snapshot.contractCount
        });
    }
}
