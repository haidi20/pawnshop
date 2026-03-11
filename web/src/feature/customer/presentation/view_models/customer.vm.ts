import { defineStore } from 'pinia';

import { unwrapEitherOrThrow } from '@core/util/either';
import { getCustomerDataUsecase } from '@feature/customer/presentation/di/customer.di';
import { customerState } from '@feature/customer/presentation/view_models/customer.state';

export const customerViewModel = defineStore('customerStore', () => {
    const state = customerState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getCustomerData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = unwrapEitherOrThrow(await getCustomerDataUsecase.execute());
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getCustomerData,
        setError
    };
});
