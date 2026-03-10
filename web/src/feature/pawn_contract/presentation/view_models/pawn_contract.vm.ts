import { defineStore } from 'pinia';

import { getPawnContractDataUsecase } from '@feature/pawn_contract/presentation/di/pawn_contract.di';
import { pawnContractState } from '@feature/pawn_contract/presentation/view_models/pawn_contract.state';

export const pawnContractViewModel = defineStore('pawnContractStore', () => {
    const state = pawnContractState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getPawnContractData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = await getPawnContractDataUsecase.execute();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getPawnContractData,
        setError
    };
});
