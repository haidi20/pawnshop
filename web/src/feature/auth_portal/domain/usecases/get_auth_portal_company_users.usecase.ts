import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { AuthPortalCompanyUsersDataModel } from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class GetAuthPortalCompanyUsersUsecase {
    constructor(private readonly repository: AuthPortalRepository) {}

    async execute(): Promise<Either<Error, AuthPortalCompanyUsersDataModel>> {
        try {
            return await this.repository.getCompanyUsers();
        } catch (error) {
            return left(toError(error));
        }
    }
}
