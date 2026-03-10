import { ref, type Ref } from 'vue';

import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';

export interface IPawnTransactionState {
    data: Ref<PawnTransactionDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const pawnTransactionState = (): IPawnTransactionState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
