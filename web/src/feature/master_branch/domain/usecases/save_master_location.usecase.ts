import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';
import type { MasterLocationUpsertPayloadModel } from '@feature/master_branch/domain/models';

export class SaveMasterLocationUsecase {
    constructor(private readonly repository: MasterBranchRepository) {}

    async execute(payload: MasterLocationUpsertPayloadModel): Promise<Either<Error, void>> {
        try {
            return await this.repository.saveLocation(payload);
        } catch (error) {
            return left(toError(error));
        }
    }
}
