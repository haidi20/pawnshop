import { left, right, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import { AuthPortalLocalDatasource } from '@feature/auth_portal/data/datasources/auth_portal_local_datasource';
import type {
    AuthPortalLoginPayloadModel,
    AuthPortalRegisterPayloadModel,
    AuthPortalSessionSnapshotModel
} from '@feature/auth_portal/domain/models';
import type { AuthPortalRepository } from '@feature/auth_portal/domain/repositories/auth_portal.repository';

export class AuthPortalRepositoryImpl implements AuthPortalRepository {
    constructor(private readonly localDatasource: AuthPortalLocalDatasource) {}

    async getCurrentSession(): Promise<Either<Error, AuthPortalSessionSnapshotModel | null>> {
        try {
            return right(await this.localDatasource.getCurrentSession());
        } catch (error) {
            return left(toError(error));
        }
    }

    async login(payload: AuthPortalLoginPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>> {
        try {
            return right(await this.localDatasource.login(payload));
        } catch (error) {
            return left(toError(error));
        }
    }

    async register(payload: AuthPortalRegisterPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>> {
        try {
            return right(await this.localDatasource.register(payload));
        } catch (error) {
            return left(toError(error));
        }
    }

    async logout(): Promise<Either<Error, void>> {
        try {
            await this.localDatasource.logout();
            return right(undefined);
        } catch (error) {
            return left(toError(error));
        }
    }
}
