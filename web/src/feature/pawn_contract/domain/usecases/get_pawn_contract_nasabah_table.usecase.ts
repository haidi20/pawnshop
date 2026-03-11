import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractNasabahTableParamsModel,
    PawnContractNasabahTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractNasabahTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractNasabahTableParamsModel): Either<Error, PawnContractNasabahTableModel> {
        try {
            return this.repository.getNasabahTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
