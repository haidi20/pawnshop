import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';
import type { PawnTransactionRepository } from '@feature/pawn_transaction/domain/repositories/pawn_transaction.repository';

export class GetPawnTransactionDataUsecase {
    constructor(private readonly repository: PawnTransactionRepository) {}

    async execute(): Promise<Either<Error, PawnTransactionDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
