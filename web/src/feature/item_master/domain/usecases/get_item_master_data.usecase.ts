import type { ItemMasterDataModel } from '@feature/item_master/domain/models';
import type { ItemMasterRepository } from '@feature/item_master/domain/repositories/item_master.repository';

export class GetItemMasterDataUsecase {
    constructor(private readonly repository: ItemMasterRepository) {}

    async execute(): Promise<ItemMasterDataModel> {
        return this.repository.getData();
    }
}
