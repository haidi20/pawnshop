import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractHistoryUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    async execute(contractId: number): Promise<Either<Error, PawnContractSummaryModel | null>> {
        try {
            return await this.repository.getHistorySummaryById(contractId);
        } catch (error) {
            return left(toError(error));
        }
    }
}
