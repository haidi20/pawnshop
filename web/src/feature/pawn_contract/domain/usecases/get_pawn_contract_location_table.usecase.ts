import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractLocationTableParamsModel,
    PawnContractLocationTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractLocationTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractLocationTableParamsModel): Either<Error, PawnContractLocationTableModel> {
        try {
            return this.repository.getLocationTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
