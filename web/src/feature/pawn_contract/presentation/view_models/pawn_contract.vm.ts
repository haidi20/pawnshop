import { defineStore } from 'pinia';

import { getPawnContractDataUsecase } from '@feature/pawn_contract/presentation/di/pawn_contract.di';
import { createPawnContractState } from '@feature/pawn_contract/presentation/view_models/pawn_contract.state';

export const pawnContractViewModel = defineStore('pawnContractStore', () => {
    const state = createPawnContractState();

    const setters = {
        setError: (message: string | null): void => {
            state.error.value = message;
        }
    };

    const actions = {
        loadData: async (): Promise<void> => {
            state.isLoading.value = true;
            setters.setError(null);

            try {
                state.data.value = await getPawnContractDataUsecase.execute();
            } catch (error) {
                setters.setError(error instanceof Error ? error.message : String(error));
            } finally {
                state.isLoading.value = false;
            }
        }
    };

    return {
        ...state,
        ...setters,
        ...actions,
        getPawnContractData: actions.loadData
    };
});
