import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    PawnContractDataModel,
    PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractSummariesUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(data: PawnContractDataModel | null): Either<Error, PawnContractSummaryModel[]> {
        try {
            return this.repository.getContractSummaries(data);
        } catch (error) {
            return left(toError(error));
        }
    }
}
