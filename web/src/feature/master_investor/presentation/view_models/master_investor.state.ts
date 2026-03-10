import { ref, type Ref } from 'vue';

import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';

export interface IMasterInvestorState {
    data: Ref<MasterInvestorDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const masterInvestorState = (): IMasterInvestorState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
