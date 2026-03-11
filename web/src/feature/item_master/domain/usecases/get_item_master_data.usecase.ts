import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { ItemMasterDataModel } from '@feature/item_master/domain/models';
import type { ItemMasterRepository } from '@feature/item_master/domain/repositories/item_master.repository';

export class GetItemMasterDataUsecase {
    constructor(private readonly repository: ItemMasterRepository) {}

    async execute(): Promise<Either<Error, ItemMasterDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
