import { AuthPortalLocalDatasource } from '@feature/auth_portal/data/datasources/auth_portal_local_datasource';
import { AuthPortalRepositoryImpl } from '@feature/auth_portal/data/repositories/auth_portal_repository_impl';
import { GetCurrentAuthPortalSessionUsecase } from '@feature/auth_portal/domain/usecases/get_current_auth_portal_session.usecase';
import { GetAuthPortalCompanyUsersUsecase } from '@feature/auth_portal/domain/usecases/get_auth_portal_company_users.usecase';
import { LoginAuthPortalUsecase } from '@feature/auth_portal/domain/usecases/login_auth_portal.usecase';
import { LogoutAuthPortalUsecase } from '@feature/auth_portal/domain/usecases/logout_auth_portal.usecase';
import { RegisterAuthPortalUsecase } from '@feature/auth_portal/domain/usecases/register_auth_portal.usecase';
import { UpdateAuthPortalCompanyUsecase } from '@feature/auth_portal/domain/usecases/update_auth_portal_company.usecase';
import { UpdateAuthPortalProfileUsecase } from '@feature/auth_portal/domain/usecases/update_auth_portal_profile.usecase';
import { UpdateAuthPortalUserBranchUsecase } from '@feature/auth_portal/domain/usecases/update_auth_portal_user_branch.usecase';

const authPortalLocalDatasource = new AuthPortalLocalDatasource();
const authPortalRepository = new AuthPortalRepositoryImpl(authPortalLocalDatasource);

export const getCurrentAuthPortalSessionUsecase = new GetCurrentAuthPortalSessionUsecase(authPortalRepository);
export const getAuthPortalCompanyUsersUsecase = new GetAuthPortalCompanyUsersUsecase(authPortalRepository);
export const loginAuthPortalUsecase = new LoginAuthPortalUsecase(authPortalRepository);
export const registerAuthPortalUsecase = new RegisterAuthPortalUsecase(authPortalRepository);
export const updateAuthPortalCompanyUsecase = new UpdateAuthPortalCompanyUsecase(authPortalRepository);
export const updateAuthPortalProfileUsecase = new UpdateAuthPortalProfileUsecase(authPortalRepository);
export const updateAuthPortalUserBranchUsecase = new UpdateAuthPortalUserBranchUsecase(authPortalRepository);
export const logoutAuthPortalUsecase = new LogoutAuthPortalUsecase(authPortalRepository);
