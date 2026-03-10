import type { AppModuleEntityBlueprint, AppModuleStatus } from '@core/domain/interfaces/app_module.interface';
import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface DashboardModulesRow {
    key: string;
    title: string;
    shortTitle: string;
    route: string;
    icon: string;
    phase: string;
    status: AppModuleStatus;
    summary: string;
    goals: string[];
    mainTables: string[];
    childResources: string[];
    entities: AppModuleEntityBlueprint[];
    nextSteps: string[];
}

export const dashboardModulesTable = createFeatureDbTable<DashboardModulesRow>({
    featureKey: 'dashboard',
    tableName: 'dashboard_modules',
    collectionName: 'dashboard_modules',
    primaryKey: 'key',
    columns: [
        { name: 'key', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'title', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'shortTitle', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'route', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'icon', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'phase', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'status', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'summary', dataType: 'string', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'goals', dataType: 'json', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'mainTables', dataType: 'json', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'childResources', dataType: 'json', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'entities', dataType: 'json', nullable: false, sqlType: 'VIRTUAL' },
        { name: 'nextSteps', dataType: 'json', nullable: false, sqlType: 'VIRTUAL' }
    ]
});
