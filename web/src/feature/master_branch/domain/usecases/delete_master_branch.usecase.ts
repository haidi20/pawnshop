import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';

export class DeleteMasterBranchUsecase {
    constructor(private readonly repository: MasterBranchRepository) {}

    async execute(branchId: number): Promise<Either<Error, void>> {
        try {
            return await this.repository.deleteBranch(branchId);
        } catch (error) {
            return left(toError(error));
        }
    }
}
