import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';
import type { AuthAccessRepository } from '@feature/auth_access/domain/repositories/auth_access.repository';

export class GetAuthAccessDataUsecase {
    constructor(private readonly repository: AuthAccessRepository) {}

    async execute(): Promise<Either<Error, AuthAccessDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
