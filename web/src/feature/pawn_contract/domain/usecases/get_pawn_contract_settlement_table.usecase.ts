import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractSettlementTableParamsModel,
    PawnContractSettlementTableModel,
    PawnContractSettlementTypeModel,
    PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Pelunasan & Lelang" — mengelompokkan kontrak
 * berdasarkan status penyelesaian: lunas (redeemed/closed), lelang (auctioned),
 * atau refund (cancelled). Memudahkan back-office memantau proses akhir kontrak.
 */
export class GetPawnContractSettlementTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(
        params: GetPawnContractSettlementTableParamsModel & {
            settlementOptions: Array<Omit<PawnContractTableOptionModel<PawnContractSettlementTypeModel>, 'count'>>;
        }
    ): Either<Error, PawnContractSettlementTableModel> {
        try {
            return this.repository.getSettlementTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
