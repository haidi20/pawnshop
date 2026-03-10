import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';
import type { AuthAccessRepository } from '@feature/auth_access/domain/repositories/auth_access.repository';

export class GetAuthAccessDataUsecase {
    constructor(private readonly repository: AuthAccessRepository) {}

    async execute(): Promise<AuthAccessDataModel> {
        return this.repository.getData();
    }
}
