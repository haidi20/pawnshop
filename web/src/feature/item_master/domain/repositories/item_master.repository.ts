import type { ItemMasterDataModel } from '@feature/item_master/domain/models';

export interface ItemMasterRepository {
    getData(): Promise<ItemMasterDataModel>;
}
