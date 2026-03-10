import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';

export interface PawnTransactionRepository {
    getData(): Promise<PawnTransactionDataModel>;
}
