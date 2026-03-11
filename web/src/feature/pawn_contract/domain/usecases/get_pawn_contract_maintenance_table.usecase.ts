import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractMaintenanceTableParamsModel,
    PawnContractMaintenanceTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

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
