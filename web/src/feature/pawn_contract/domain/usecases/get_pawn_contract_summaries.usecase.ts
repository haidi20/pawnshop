import type {
    PawnContractDataModel,
    PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractSummariesUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(data: PawnContractDataModel | null): PawnContractSummaryModel[] {
        return this.repository.getContractSummaries(data);
    }
}
