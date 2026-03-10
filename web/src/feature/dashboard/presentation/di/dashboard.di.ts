import { DashboardLocalDatasource } from '@feature/dashboard/data/datasources/dashboard_local_datasource';
import { DashboardRepositoryImpl } from '@feature/dashboard/data/repositories/dashboard_repository_impl';
import { GetDashboardDataUsecase } from '@feature/dashboard/domain/usecases/get_dashboard_data.usecase';

const dashboardLocalDatasource = new DashboardLocalDatasource();
const dashboardRepository = new DashboardRepositoryImpl(dashboardLocalDatasource);

export const getDashboardDataUsecase = new GetDashboardDataUsecase(dashboardRepository);
