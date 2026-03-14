import { ref, type Ref } from 'vue';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';

export interface PawnContractStorageFeeState {
    row: Ref<PawnContractSummaryModel | null>;
    selectedPeriodIds: Ref<(number | string)[]>;
    isPayingOff: Ref<boolean>;
    isSubmitting: Ref<boolean>;
}

export const createPawnContractStorageFeeState = (): PawnContractStorageFeeState => ({
    row: ref(null),
    selectedPeriodIds: ref([]),
    isPayingOff: ref(false),
    isSubmitting: ref(false)
});
