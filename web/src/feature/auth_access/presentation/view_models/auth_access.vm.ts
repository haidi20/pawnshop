import { defineStore } from 'pinia';

import { unwrapEitherOrThrow } from '@core/util/either';
import { getAuthAccessDataUsecase } from '@feature/auth_access/presentation/di/auth_access.di';
import { authAccessState } from '@feature/auth_access/presentation/view_models/auth_access.state';

export const authAccessViewModel = defineStore('authAccessStore', () => {
    const state = authAccessState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getAuthAccessData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = unwrapEitherOrThrow(await getAuthAccessDataUsecase.execute());
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getAuthAccessData,
        setError
    };
});
