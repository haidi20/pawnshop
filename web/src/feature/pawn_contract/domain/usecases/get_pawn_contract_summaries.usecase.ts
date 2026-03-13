import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    PawnContractActionOptionModel,
    PawnContractDataModel,
    PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractStatusModel } from '@core/util/helpers';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Mengolah data mentah gadai menjadi daftar ringkasan kontrak (summaries).
 * Setiap summary berisi info nasabah, cabang, jaminan, status jatuh tempo,
 * estimasi tunggakan, dan aksi yang tersedia untuk kontrak tersebut.
 * Menjadi sumber data bagi seluruh tabel di halaman index gadai.
 */
export class GetPawnContractSummariesUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: {
        data: PawnContractDataModel | null;
        runningContractStatuses: Set<PawnContractStatusModel>;
        getAvailableActions: (params: { contractStatus: string; daysToMaturity: number }) => PawnContractActionOptionModel[];
    }): Either<Error, PawnContractSummaryModel[]> {
        try {
            return this.repository.getContractSummaries(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
