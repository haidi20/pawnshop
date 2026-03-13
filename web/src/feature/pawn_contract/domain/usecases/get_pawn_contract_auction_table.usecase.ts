import { left, type Either } from 'fp-ts/Either';
import type {
    PawnContractSettlementTableModel,
    PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Lelang" — menampilkan daftar kontrak yang sudah masuk
 * dalam proses lelang (status auctioned).
 */
export class GetPawnContractAuctionTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel> {
        return this.repository.getAuctionTable(params);
    }
}
