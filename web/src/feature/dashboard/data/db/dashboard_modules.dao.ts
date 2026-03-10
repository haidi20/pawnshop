import { getAppModules } from '@core/data/datasources/app_module_catalog';
import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { dashboardModulesTable, type DashboardModulesRow } from '@feature/dashboard/data/db/dashboard_modules.table';

export class DashboardModulesDao extends FeatureTableDao<DashboardModulesRow> {
    constructor() {
        super(dashboardModulesTable);
    }

    protected override async loadSeedRecords(): Promise<DashboardModulesRow[]> {
        return getAppModules();
    }
}

export const dashboardModulesDao = new DashboardModulesDao();
