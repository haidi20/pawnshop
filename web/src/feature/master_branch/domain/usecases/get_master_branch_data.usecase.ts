import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';

export class GetMasterBranchDataUsecase {
    constructor(private readonly repository: MasterBranchRepository) {}

    async execute(): Promise<MasterBranchDataModel> {
        return this.repository.getData();
    }
}
