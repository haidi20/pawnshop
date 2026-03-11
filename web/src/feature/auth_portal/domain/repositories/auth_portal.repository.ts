import type { Either } from 'fp-ts/Either';
import type {
    AuthPortalLoginPayloadModel,
    AuthPortalRegisterPayloadModel,
    AuthPortalSessionSnapshotModel
} from '@feature/auth_portal/domain/models';

export interface AuthPortalRepository {
    getCurrentSession(): Promise<Either<Error, AuthPortalSessionSnapshotModel | null>>;
    login(payload: AuthPortalLoginPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>>;
    register(payload: AuthPortalRegisterPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>>;
    logout(): Promise<Either<Error, void>>;
}
