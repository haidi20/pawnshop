import { ref, type Ref } from 'vue';

import type { ItemMasterDataModel } from '@feature/item_master/domain/models';

export interface IItemMasterState {
    data: Ref<ItemMasterDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const itemMasterState = (): IItemMasterState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
