import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractMaintenanceTableParamsModel,
    PawnContractMaintenanceTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Maintenance" — menampilkan kontrak yang masuk
 * window maintenance (15-30 hari sejak tanggal gadai, tenor > 7 hari).
 * Digunakan untuk checklist inspeksi dan pemeriksaan operasional barang jaminan.
 */
export class GetPawnContractMaintenanceTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(
        params: GetPawnContractMaintenanceTableParamsModel
    ): Either<Error, PawnContractMaintenanceTableModel> {
        try {
            return this.repository.getMaintenanceTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
