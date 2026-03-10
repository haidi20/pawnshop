import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';
import type { BranchFinanceRepository } from '@feature/branch_finance/domain/repositories/branch_finance.repository';

export class GetBranchFinanceDataUsecase {
    constructor(private readonly repository: BranchFinanceRepository) {}

    async execute(): Promise<BranchFinanceDataModel> {
        return this.repository.getData();
    }
}
