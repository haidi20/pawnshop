import type { ItemMasterDataModel } from '@feature/item_master/domain/models';

export interface IItemMasterResponse {
    success: boolean;
    data: ItemMasterDataModel;
    message: string;
}
