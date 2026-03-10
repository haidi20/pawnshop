import { ItemMasterLocalDatasource } from '@feature/item_master/data/datasources/item_master_local_datasource';
import { ItemMasterRepositoryImpl } from '@feature/item_master/data/repositories/item_master_repository_impl';
import { GetItemMasterDataUsecase } from '@feature/item_master/domain/usecases/get_item_master_data.usecase';

const itemMasterLocalDatasource = new ItemMasterLocalDatasource();
const itemMasterRepository = new ItemMasterRepositoryImpl(itemMasterLocalDatasource);

export const getItemMasterDataUsecase = new GetItemMasterDataUsecase(itemMasterRepository);
