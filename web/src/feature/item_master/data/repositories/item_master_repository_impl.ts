import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { itemCategoriesDao, itemTypesDao, branchItemSettingsDao } from '@feature/item_master/data/db';
import { ItemMasterLocalDatasource } from '@feature/item_master/data/datasources/item_master_local_datasource';
import type { ItemMasterDataModel } from '@feature/item_master/domain/models';
import type { ItemMasterRepository } from '@feature/item_master/domain/repositories/item_master.repository';

export class ItemMasterRepositoryImpl implements ItemMasterRepository {
    constructor(private readonly localDataSource: ItemMasterLocalDatasource) {}

    async getData(): Promise<ItemMasterDataModel> {
        await seedFeatureTablesIfEmpty('ItemMasterRepositoryImpl', [
            itemCategoriesDao,
            itemTypesDao,
            branchItemSettingsDao
        ]);

        return this.localDataSource.getData();
    }
}
