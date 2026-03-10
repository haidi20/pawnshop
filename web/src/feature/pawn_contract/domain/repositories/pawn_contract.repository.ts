import type { PawnContractDataModel } from '@feature/pawn_contract/domain/models';

export interface PawnContractRepository {
    getData(): Promise<PawnContractDataModel>;
}
