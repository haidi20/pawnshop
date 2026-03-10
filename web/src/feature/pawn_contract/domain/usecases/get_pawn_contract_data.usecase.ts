import type { PawnContractDataModel } from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractDataUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    async execute(): Promise<PawnContractDataModel> {
        return this.repository.getData();
    }
}
