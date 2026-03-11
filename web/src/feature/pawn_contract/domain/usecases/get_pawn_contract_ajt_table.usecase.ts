import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractAjtTableParamsModel,
    PawnContractAjtTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractAjtTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractAjtTableParamsModel): Either<Error, PawnContractAjtTableModel> {
        try {
            return this.repository.getAjtTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
