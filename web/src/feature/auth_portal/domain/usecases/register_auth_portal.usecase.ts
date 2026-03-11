import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    AuthPortalRegisterPayloadModel,
    AuthPortalSessionSnapshotModel
} from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class RegisterAuthPortalUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(payload: AuthPortalRegisterPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>> {
        try {
            return await this.repository.register(payload);
        } catch (error) {
            return left(toError(error));
        }
    }
}
