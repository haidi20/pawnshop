import type {
    GetPawnContractMaintenanceTableParamsModel,
    PawnContractMaintenanceTableModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractMaintenanceTableUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractMaintenanceTableParamsModel): PawnContractMaintenanceTableModel {
        return this.repository.getMaintenanceTable(params);
    }
}
