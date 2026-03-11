import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractSettlementTableParamsModel,
    PawnContractSettlementTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractSettlementTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(
        params: GetPawnContractSettlementTableParamsModel
    ): Either<Error, PawnContractSettlementTableModel> {
        try {
            return this.repository.getSettlementTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
