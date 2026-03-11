import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { AuthPortalSessionSnapshotModel } from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class GetCurrentAuthPortalSessionUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(): Promise<Either<Error, AuthPortalSessionSnapshotModel | null>> {
        try {
            return await this.repository.getCurrentSession();
        } catch (error) {
            return left(toError(error));
        }
    }
}
