import { defineStore } from 'pinia';

import { unwrapEitherOrThrow } from '@core/util/either';
import { getMasterBranchDataUsecase } from '@feature/master_branch/presentation/di/master_branch.di';
import { masterBranchState } from '@feature/master_branch/presentation/view_models/master_branch.state';

export const masterBranchViewModel = defineStore('masterBranchStore', () => {
    const state = masterBranchState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getMasterBranchData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = unwrapEitherOrThrow(await getMasterBranchDataUsecase.execute());
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getMasterBranchData,
        setError
    };
});
