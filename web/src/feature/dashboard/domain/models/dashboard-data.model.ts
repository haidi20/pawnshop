import type { DashboardModuleModel } from '@feature/dashboard/domain/models/dashboard-module.model';

export interface DashboardDataModel {
    modules: DashboardModuleModel[];
    totalModules: number;
    totalPrimaryTables: number;
    totalChildResources: number;
}

export const createDashboardDataModel = (modules: DashboardModuleModel[]): DashboardDataModel => ({
    modules,
    totalModules: modules.length,
    totalPrimaryTables: modules.reduce(
        (total, module) => total + module.entities.filter((entity) => entity.role === 'primary').length,
        0
    ),
    totalChildResources: modules.reduce((total, module) => total + module.childResources.length, 0)
});
