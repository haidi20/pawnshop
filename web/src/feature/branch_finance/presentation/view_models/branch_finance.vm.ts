import { defineStore } from 'pinia';

import { getBranchFinanceDataUsecase } from '@feature/branch_finance/presentation/di/branch_finance.di';
import { branchFinanceState } from '@feature/branch_finance/presentation/view_models/branch_finance.state';

export const branchFinanceViewModel = defineStore('branchFinanceStore', () => {
    const state = branchFinanceState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getBranchFinanceData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = await getBranchFinanceDataUsecase.execute();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getBranchFinanceData,
        setError
    };
});
