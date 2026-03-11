import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { BranchModel } from '@feature/master_branch/domain/models/branch.model';
import type { StorageLocationModel } from '@feature/master_branch/domain/models/storage-location.model';

export interface MasterBranchDataModel extends FeatureModuleDataModel {
    branches: BranchModel[];
    storageLocations: StorageLocationModel[];
}

export const createMasterBranchDataModel = (params: {
    module: AppModuleSummary;
    branches: BranchModel[];
    storageLocations: StorageLocationModel[];
}): MasterBranchDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'branches', label: 'Cabang', count: params.branches.length },
        { key: 'storage_locations', label: 'Lokasi penyimpanan', count: params.storageLocations.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
