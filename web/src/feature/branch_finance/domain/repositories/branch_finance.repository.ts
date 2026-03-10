import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';

export interface BranchFinanceRepository {
    getData(): Promise<BranchFinanceDataModel>;
}
