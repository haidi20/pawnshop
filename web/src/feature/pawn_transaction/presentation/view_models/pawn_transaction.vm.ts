import { defineStore } from 'pinia';

import { getPawnTransactionDataUsecase } from '@feature/pawn_transaction/presentation/di/pawn_transaction.di';
import { pawnTransactionState } from '@feature/pawn_transaction/presentation/view_models/pawn_transaction.state';

export const pawnTransactionViewModel = defineStore('pawnTransactionStore', () => {
    const state = pawnTransactionState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getPawnTransactionData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = await getPawnTransactionDataUsecase.execute();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getPawnTransactionData,
        setError
    };
});
