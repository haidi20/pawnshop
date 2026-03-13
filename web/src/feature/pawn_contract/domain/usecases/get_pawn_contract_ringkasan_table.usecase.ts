import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractRingkasanTableParamsModel,
    PawnContractRingkasanTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Ringkasan Harian" — merangkum aktivitas gadai hari ini
 * meliputi gadai baru, gadai ulang (perpanjangan), serta pendapatan harian
 * dari biaya titip dan biaya administrasi.
 */
export class GetPawnContractRingkasanTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(
        params: GetPawnContractRingkasanTableParamsModel
    ): Either<Error, PawnContractRingkasanTableModel> {
        try {
            return this.repository.getRingkasanTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
