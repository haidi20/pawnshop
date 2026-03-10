import { ref, type Ref } from 'vue';

import type { PawnContractDataModel } from '@feature/pawn_contract/domain/models';

export interface IPawnContractState {
    data: Ref<PawnContractDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const createPawnContractState = (): IPawnContractState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});

export const pawnContractState = createPawnContractState;
