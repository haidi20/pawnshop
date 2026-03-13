import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    PawnContractDataFilterModel,
    PawnContractDataModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

/**
 * Mengambil data utama gadai (kontrak, nasabah, cabang, barang jaminan)
 * dari local database berdasarkan filter yang diberikan.
 * Data ini menjadi sumber utama untuk seluruh tampilan index gadai.
 */
export class GetPawnContractDataUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    async execute(filters?: PawnContractDataFilterModel): Promise<Either<Error, PawnContractDataModel>> {
        try {
            return await this.repository.getData(filters);
        } catch (error) {
            return left(toError(error));
        }
    }
}
