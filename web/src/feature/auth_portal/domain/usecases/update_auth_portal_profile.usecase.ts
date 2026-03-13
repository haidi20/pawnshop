import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    AuthPortalSessionSnapshotModel,
    AuthPortalUpdateProfilePayloadModel
} from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class UpdateAuthPortalProfileUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(payload: AuthPortalUpdateProfilePayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>> {
        try {
            return await this.repository.updateProfile(payload);
        } catch (error) {
            return left(toError(error));
        }
    }
}
