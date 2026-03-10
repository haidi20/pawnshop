import { ref, type Ref } from 'vue';

import type {
    PawnContractAjtTypeModel,
    PawnContractDataModel,
    PawnContractIndexTabKeyModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractStatusModel } from '@core/util/helpers';

export type PawnContractQuickFilterKeyModel =
    | 'all'
    | 'open'
    | 'due_soon'
    | 'maintenance'
    | 'warehouse';
export type {
    PawnContractAjtTypeModel,
    PawnContractIndexTabKeyModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel
} from '@feature/pawn_contract/domain/models';

export interface IPawnContractState {
    data: Ref<PawnContractDataModel | null>;
    filteredData: Ref<PawnContractDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    activeIndexTab: Ref<PawnContractIndexTabKeyModel>;
    activeNasabahTab: Ref<PawnContractNasabahTabKeyModel>;
    activeAjtType: Ref<PawnContractAjtTypeModel>;
    activeSettlementType: Ref<PawnContractSettlementTypeModel>;
    activeLocationTab: Ref<PawnContractLocationTabModel>;
    quickFilter: Ref<PawnContractQuickFilterKeyModel>;
    branchFilter: Ref<string>;
    statusFilter: Ref<'all' | PawnContractStatusModel>;
    selectedContractId: Ref<number | null>;
}

export const createPawnContractState = (): IPawnContractState => ({
    data: ref(null),
    filteredData: ref(null),
    isLoading: ref(false),
    error: ref(null),
    activeIndexTab: ref('nasabah_akad'),
    activeNasabahTab: ref('seluruh_data'),
    activeAjtType: ref('30'),
    activeSettlementType: ref('lunas'),
    activeLocationTab: ref('kantor'),
    quickFilter: ref('all'),
    branchFilter: ref('all'),
    statusFilter: ref('all'),
    selectedContractId: ref(null)
});

export const pawnContractState = createPawnContractState;
