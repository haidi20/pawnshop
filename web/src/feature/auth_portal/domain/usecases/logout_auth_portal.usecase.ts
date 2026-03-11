import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class LogoutAuthPortalUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(): Promise<Either<Error, void>> {
        try {
            return await this.repository.logout();
        } catch (error) {
            return left(toError(error));
        }
    }
}
