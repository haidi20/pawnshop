import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractIndexTabsParamsModel,
    PawnContractIndexTabModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menghasilkan daftar tab navigasi halaman index gadai beserta jumlah (count)
 * masing-masing: Nasabah Gadai, Ringkasan Harian, Gadai Jatuh Tempo,
 * Pelunasan & Lelang, Lokasi / Distribusi, dan Maintenance.
 */
export class GetPawnContractIndexTabsUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractIndexTabsParamsModel & {
        indexTabs: Array<Omit<PawnContractIndexTabModel, 'count'>>;
    }): Either<Error, PawnContractIndexTabModel[]> {
        try {
            return this.repository.getIndexTabs(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
