import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    AuthPortalLoginPayloadModel,
    AuthPortalSessionSnapshotModel
} from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class LoginAuthPortalUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(payload: AuthPortalLoginPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>> {
        try {
            return await this.repository.login(payload);
        } catch (error) {
            return left(toError(error));
        }
    }
}
