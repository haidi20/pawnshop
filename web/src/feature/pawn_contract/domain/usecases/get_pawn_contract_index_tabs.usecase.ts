import type {
    GetPawnContractIndexTabsParamsModel,
    PawnContractIndexTabModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractIndexTabsUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractIndexTabsParamsModel): PawnContractIndexTabModel[] {
        return this.repository.getIndexTabs(params);
    }
}
