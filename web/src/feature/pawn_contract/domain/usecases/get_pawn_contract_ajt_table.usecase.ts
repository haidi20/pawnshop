import type {
    GetPawnContractAjtTableParamsModel,
    PawnContractAjtTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractAjtTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractAjtTableParamsModel): PawnContractAjtTableModel {
        return this.repository.getAjtTable(params);
    }
}
