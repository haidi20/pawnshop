import type { PawnContractDataModel } from '@feature/pawn_contract/domain/models';

export interface IPawnContractResponse {
    success: boolean;
    data: PawnContractDataModel;
    message: string;
}
