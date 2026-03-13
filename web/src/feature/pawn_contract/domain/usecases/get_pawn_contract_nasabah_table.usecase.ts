import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractNasabahTableParamsModel,
    PawnContractNasabahTabKeyModel,
    PawnContractNasabahTableModel,
    PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Nasabah Gadai" — mengelompokkan kontrak aktif
 * berdasarkan jadwal pembayaran (harian, 7 hari, 15 hari) dan umur kontrak (bulan).
 * Menghasilkan tab navigasi, section bulanan, serta total pokok dan tunggakan.
 */
export class GetPawnContractNasabahTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractNasabahTableParamsModel & {
        nasabahTabs: Array<Omit<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>, 'count'>>;
    }): Either<Error, PawnContractNasabahTableModel> {
        try {
            return this.repository.getNasabahTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
