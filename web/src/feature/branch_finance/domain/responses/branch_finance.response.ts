import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';

export interface IBranchFinanceResponse {
    success: boolean;
    data: BranchFinanceDataModel;
    message: string;
}
