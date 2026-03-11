import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';

export class DeleteMasterLocationUsecase {
    constructor(private readonly repository: MasterBranchRepository) {}

    async execute(locationId: number): Promise<Either<Error, void>> {
        try {
            return await this.repository.deleteLocation(locationId);
        } catch (error) {
            return left(toError(error));
        }
    }
}
