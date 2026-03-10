import { ref, type Ref } from 'vue';
import type { DashboardDataModel } from '@feature/dashboard/domain/models';

export interface IDashboardState {
    data: Ref<DashboardDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const dashboardState = (): IDashboardState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
