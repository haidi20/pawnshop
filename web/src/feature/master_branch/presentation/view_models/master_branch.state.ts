import { ref, type Ref } from 'vue';

import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';

export interface IMasterBranchState {
    data: Ref<MasterBranchDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const masterBranchState = (): IMasterBranchState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
