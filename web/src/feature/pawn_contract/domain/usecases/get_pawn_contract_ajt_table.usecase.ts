import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractAjtTableParamsModel,
    PawnContractAjtTableModel,
    PawnContractAjtTypeModel,
    PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Menyusun data tabel "Gadai Jatuh Tempo" (AJT) — mengelompokkan kontrak aktif
 * berdasarkan tenor (7, 15, 30, 60 hari) dan tingkat keterlambatan
 * (tertunggak, mendekati lelang, tempo lelang, tunda lelang).
 * Membantu pemantauan gadai yang memerlukan tindak lanjut segera.
 */
export class GetPawnContractAjtTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractAjtTableParamsModel & {
        ajtOptions: Array<Omit<PawnContractTableOptionModel<PawnContractAjtTypeModel>, 'count'>>;
    }): Either<Error, PawnContractAjtTableModel> {
        try {
            return this.repository.getAjtTable(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
