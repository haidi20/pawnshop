import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';

export interface IMasterBranchResponse {
    success: boolean;
    data: MasterBranchDataModel;
    message: string;
}
