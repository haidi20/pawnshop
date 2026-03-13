import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractLocationTableParamsModel,
    PawnContractLocationTableModel,
    PawnContractLocationTabModel,
    PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Lokasi / Distribusi" — melacak posisi barang jaminan
 * berdasarkan lokasi: kantor, gudang, atau sedang dalam proses perpindahan.
 * Menampilkan aksi yang tersedia (kirim ke gudang/kantor) untuk setiap barang.
 */
export class GetPawnContractLocationTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractLocationTableParamsModel & {
        locationOptions: Array<Omit<PawnContractTableOptionModel<PawnContractLocationTabModel>, 'count'>>;
    }): Either<Error, PawnContractLocationTableModel> {
        try {
            return this.repository.getLocationTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
