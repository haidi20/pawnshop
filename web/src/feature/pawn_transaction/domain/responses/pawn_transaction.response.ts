import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';

export interface IPawnTransactionResponse {
    success: boolean;
    data: PawnTransactionDataModel;
    message: string;
}
