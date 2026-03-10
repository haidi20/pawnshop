import type {
    GetPawnContractRingkasanTableParamsModel,
    PawnContractRingkasanTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractRingkasanTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractRingkasanTableParamsModel): PawnContractRingkasanTableModel {
        return this.repository.getRingkasanTable(params);
    }
}
