import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { ItemCategoriesRow, ItemTypesRow, BranchItemSettingsRow } from '@feature/item_master/data/db';
import { createItemMasterDataModel, type ItemCategoryModel, type ItemTypeModel, type BranchItemSettingModel, type ItemMasterDataModel } from '@feature/item_master/domain/models';

export const mapItemCategoriesRowToModel = (row: ItemCategoriesRow): ItemCategoryModel => ({
    id: row.id,
    categoryCode: row.category_code,
    categoryName: row.category_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapItemTypesRowToModel = (row: ItemTypesRow): ItemTypeModel => ({
    id: row.id,
    categoryId: row.category_id,
    typeCode: row.type_code,
    typeName: row.type_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapBranchItemSettingsRowToModel = (row: BranchItemSettingsRow): BranchItemSettingModel => ({
    id: row.id,
    branchId: row.branch_id,
    itemTypeId: row.item_type_id,
    marginRate: row.margin_rate,
    deductionRate: row.deduction_rate,
    effectiveFrom: row.effective_from,
    effectiveUntil: row.effective_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createItemMasterDataFromRows = (params: {
    module: AppModuleSummary;
    itemCategoriesRows: ItemCategoriesRow[];
    itemTypesRows: ItemTypesRow[];
    branchItemSettingsRows: BranchItemSettingsRow[];
}): ItemMasterDataModel =>
    createItemMasterDataModel({
        module: params.module,
        itemCategories: params.itemCategoriesRows.map(mapItemCategoriesRowToModel),
        itemTypes: params.itemTypesRows.map(mapItemTypesRowToModel),
        branchItemSettings: params.branchItemSettingsRows.map(mapBranchItemSettingsRowToModel),
    });
