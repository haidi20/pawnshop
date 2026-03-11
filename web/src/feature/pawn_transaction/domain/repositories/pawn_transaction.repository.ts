import type { Either } from 'fp-ts/Either';
import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';

export interface PawnTransactionRepository {
    getData(): Promise<Either<Error, PawnTransactionDataModel>>;
}
