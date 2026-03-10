import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';

export interface MasterBranchRepository {
    getData(): Promise<MasterBranchDataModel>;
}
