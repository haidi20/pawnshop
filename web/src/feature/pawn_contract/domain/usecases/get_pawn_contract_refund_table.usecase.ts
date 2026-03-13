import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    PawnContractSettlementTableModel,
    PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data khusus untuk tabel tab "Refund" — memfilter kontrak
 * dengan status 'cancelled' yang memerlukan proses pengembalian dana.
 */
export class GetPawnContractRefundTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel> {
        try {
            return this.repository.getRefundTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
