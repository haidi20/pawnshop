import type {
    GetPawnContractNasabahTableParamsModel,
    PawnContractNasabahTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractNasabahTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractNasabahTableParamsModel): PawnContractNasabahTableModel {
        return this.repository.getNasabahTable(params);
    }
}
