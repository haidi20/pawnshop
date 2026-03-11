import { defineStore } from 'pinia';

import { unwrapEitherOrThrow } from '@core/util/either';
import { getItemMasterDataUsecase } from '@feature/item_master/presentation/di/item_master.di';
import { itemMasterState } from '@feature/item_master/presentation/view_models/item_master.state';

export const itemMasterViewModel = defineStore('itemMasterStore', () => {
    const state = itemMasterState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getItemMasterData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = unwrapEitherOrThrow(await getItemMasterDataUsecase.execute());
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getItemMasterData,
        setError
    };
});
