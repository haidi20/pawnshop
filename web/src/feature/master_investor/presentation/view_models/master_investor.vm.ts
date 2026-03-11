import { defineStore } from 'pinia';

import { unwrapEitherOrThrow } from '@core/util/either';
import { getMasterInvestorDataUsecase } from '@feature/master_investor/presentation/di/master_investor.di';
import { masterInvestorState } from '@feature/master_investor/presentation/view_models/master_investor.state';

export const masterInvestorViewModel = defineStore('masterInvestorStore', () => {
    const state = masterInvestorState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getMasterInvestorData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = unwrapEitherOrThrow(await getMasterInvestorDataUsecase.execute());
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getMasterInvestorData,
        setError
    };
});
