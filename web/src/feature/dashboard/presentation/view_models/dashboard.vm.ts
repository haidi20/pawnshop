import { defineStore } from 'pinia';

import { getDashboardDataUsecase } from '@feature/dashboard/presentation/di/dashboard.di';
import { dashboardState } from '@feature/dashboard/presentation/view_models/dashboard.state';

export const dashboardViewModel = defineStore('dashboardStore', () => {
    const state = dashboardState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const getDashboardData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = await getDashboardDataUsecase.execute();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    return {
        ...state,
        getDashboardData,
        setError
    };
});
