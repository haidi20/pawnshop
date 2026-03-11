import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { MasterBranchUpsertPayloadModel } from '@feature/master_branch/domain/models';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';

export class SaveMasterBranchUsecase {
    constructor(private readonly repository: MasterBranchRepository) {}

    async execute(payload: MasterBranchUpsertPayloadModel): Promise<Either<Error, void>> {
        try {
            return await this.repository.saveBranch(payload);
        } catch (error) {
            return left(toError(error));
        }
    }
}
