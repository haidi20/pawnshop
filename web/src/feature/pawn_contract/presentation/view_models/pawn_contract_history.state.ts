import { ref, type Ref } from 'vue';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';

export interface PawnContractHistoryState {
    currentContractId: Ref<number | null>;
    summary: Ref<PawnContractSummaryModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const createPawnContractHistoryState = (): PawnContractHistoryState => ({
    currentContractId: ref(null),
    summary: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
