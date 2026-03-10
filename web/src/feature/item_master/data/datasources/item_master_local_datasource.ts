import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { itemCategoriesDao, itemTypesDao, branchItemSettingsDao } from '@feature/item_master/data/db';
import { createItemMasterDataFromRows } from '@feature/item_master/data/mappers/item_master.mapper';
import type { ItemMasterDataModel } from '@feature/item_master/domain/models';

export class ItemMasterLocalDatasource {
    async getData(): Promise<ItemMasterDataModel> {
        const [
            itemCategoriesRows,
            itemTypesRows,
            branchItemSettingsRows
        ] = await Promise.all([
            itemCategoriesDao.getAll(),
            itemTypesDao.getAll(),
            branchItemSettingsDao.getAll()
        ]);

        return createItemMasterDataFromRows({
            module: getAppModuleByKey('item-master'),
            itemCategoriesRows,
            itemTypesRows,
            branchItemSettingsRows,
        });
    }
}
