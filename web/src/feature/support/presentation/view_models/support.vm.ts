import { defineStore } from 'pinia';

import { getSupportDataUsecase } from '@feature/support/presentation/di/support.di';
import { supportState } from '@feature/support/presentation/view_models/support.state';

export const supportViewModel = defineStore('supportStore', () => {
    const state = supportState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getSupportData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = await getSupportDataUsecase.execute();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getSupportData,
        setError
    };
});
