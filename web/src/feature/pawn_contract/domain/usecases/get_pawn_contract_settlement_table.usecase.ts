import type {
    GetPawnContractSettlementTableParamsModel,
    PawnContractSettlementTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractSettlementTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractSettlementTableParamsModel): PawnContractSettlementTableModel {
        return this.repository.getSettlementTable(params);
    }
}
