import type { Either } from 'fp-ts/Either';
import type {
    AuthPortalCompanyUsersDataModel,
    AuthPortalLoginPayloadModel,
    AuthPortalRegisterPayloadModel,
    AuthPortalSessionSnapshotModel,
    AuthPortalUpdateCompanyPayloadModel,
    AuthPortalUpdateUserBranchPayloadModel
} from '@feature/auth_portal/domain/models';

export interface AuthPortalRepository {
    getCurrentSession(): Promise<Either<Error, AuthPortalSessionSnapshotModel | null>>;
    getCompanyUsers(): Promise<Either<Error, AuthPortalCompanyUsersDataModel>>;
    login(payload: AuthPortalLoginPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>>;
    register(payload: AuthPortalRegisterPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>>;
    updateCompany(payload: AuthPortalUpdateCompanyPayloadModel): Promise<Either<Error, AuthPortalSessionSnapshotModel>>;
    updateUserBranchAssignment(payload: AuthPortalUpdateUserBranchPayloadModel): Promise<Either<Error, void>>;
    logout(): Promise<Either<Error, void>>;
}
