import { ref, type Ref } from 'vue';

import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';

export interface IBranchFinanceState {
    data: Ref<BranchFinanceDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const branchFinanceState = (): IBranchFinanceState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
