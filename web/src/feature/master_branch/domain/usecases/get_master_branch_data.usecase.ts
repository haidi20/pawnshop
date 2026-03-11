import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';

export class GetMasterBranchDataUsecase {
    constructor(private readonly repository: MasterBranchRepository) {}

    async execute(): Promise<Either<Error, MasterBranchDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
