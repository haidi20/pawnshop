import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { AuthPortalUpdateUserBranchPayloadModel } from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class UpdateAuthPortalUserBranchUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(payload: AuthPortalUpdateUserBranchPayloadModel): Promise<Either<Error, void>> {
        try {
            return await this.repository.updateUserBranchAssignment(payload);
        } catch (error) {
            return left(toError(error));
        }
    }
}
