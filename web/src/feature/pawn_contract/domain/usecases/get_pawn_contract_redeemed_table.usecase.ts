import { left, type Either } from 'fp-ts/Either';
import type {
    PawnContractSettlementTableModel,
    PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Lunas" — menampilkan daftar kontrak yang sudah dilunasi
 * secara penuh oleh nasabah (status redeemed atau closed).
 */
export class GetPawnContractRedeemedTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel> {
        return this.repository.getRedeemedTable(params);
    }
}
