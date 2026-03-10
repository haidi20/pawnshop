import type {
    GetPawnContractLocationTableParamsModel,
    PawnContractLocationTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractLocationTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractLocationTableParamsModel): PawnContractLocationTableModel {
        return this.repository.getLocationTable(params);
    }
}
