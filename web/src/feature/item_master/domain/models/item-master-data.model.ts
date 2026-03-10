import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { ItemCategoryModel } from '@feature/item_master/domain/models/item-category.model';
import type { ItemTypeModel } from '@feature/item_master/domain/models/item-type.model';
import type { BranchItemSettingModel } from '@feature/item_master/domain/models/branch-item-setting.model';

export interface ItemMasterDataModel extends FeatureModuleDataModel {
    itemCategories: ItemCategoryModel[];
    itemTypes: ItemTypeModel[];
    branchItemSettings: BranchItemSettingModel[];
}

export const createItemMasterDataModel = (params: {
    module: AppModuleSummary;
    itemCategories: ItemCategoryModel[];
    itemTypes: ItemTypeModel[];
    branchItemSettings: BranchItemSettingModel[];
}): ItemMasterDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'item_categories', label: 'Item Categories', count: params.itemCategories.length },
        { key: 'item_types', label: 'Item Types', count: params.itemTypes.length },
        { key: 'branch_item_settings', label: 'Branch Item Settings', count: params.branchItemSettings.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
