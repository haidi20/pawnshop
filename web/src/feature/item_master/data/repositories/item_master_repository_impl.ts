import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { itemCategoriesDao, itemTypesDao, branchItemSettingsDao } from '@feature/item_master/data/db';
import { ItemMasterLocalDatasource } from '@feature/item_master/data/datasources/item_master_local_datasource';
import type { ItemMasterDataModel } from '@feature/item_master/domain/models';
import type { ItemMasterRepository } from '@feature/item_master/domain/repositories/item_master.repository';

export class ItemMasterRepositoryImpl implements ItemMasterRepository {
    constructor(private readonly localDataSource: ItemMasterLocalDatasource) {}

    async getData(): Promise<Either<Error, ItemMasterDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('ItemMasterRepositoryImpl', [
                itemCategoriesDao,
                itemTypesDao,
                branchItemSettingsDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
