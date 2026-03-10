import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';
import type { PawnTransactionRepository } from '@feature/pawn_transaction/domain/repositories/pawn_transaction.repository';

export class GetPawnTransactionDataUsecase {
    constructor(private readonly repository: PawnTransactionRepository) {}

    async execute(): Promise<PawnTransactionDataModel> {
        return this.repository.getData();
    }
}
