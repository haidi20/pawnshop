import type { Either } from 'fp-ts/Either';
import type { ItemMasterDataModel } from '@feature/item_master/domain/models';

export interface ItemMasterRepository {
    getData(): Promise<Either<Error, ItemMasterDataModel>>;
}
