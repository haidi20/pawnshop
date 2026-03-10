import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';

export interface FeatureTableCountModel {
    key: string;
    label: string;
    count: number;
}

export interface FeatureModuleDataModel {
    module: AppModuleSummary;
    tableCounts: FeatureTableCountModel[];
    totalRows: number;
}
