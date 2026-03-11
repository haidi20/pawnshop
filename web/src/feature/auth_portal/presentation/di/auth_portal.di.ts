import { AuthPortalLocalDatasource } from '@feature/auth_portal/data/datasources/auth_portal_local_datasource';
import { AuthPortalRepositoryImpl } from '@feature/auth_portal/data/repositories/auth_portal_repository_impl';
import { GetCurrentAuthPortalSessionUsecase } from '@feature/auth_portal/domain/usecases/get_current_auth_portal_session.usecase';
import { LoginAuthPortalUsecase } from '@feature/auth_portal/domain/usecases/login_auth_portal.usecase';
import { LogoutAuthPortalUsecase } from '@feature/auth_portal/domain/usecases/logout_auth_portal.usecase';
import { RegisterAuthPortalUsecase } from '@feature/auth_portal/domain/usecases/register_auth_portal.usecase';

const authPortalLocalDatasource = new AuthPortalLocalDatasource();
const authPortalRepository = new AuthPortalRepositoryImpl(authPortalLocalDatasource);

export const getCurrentAuthPortalSessionUsecase = new GetCurrentAuthPortalSessionUsecase(authPortalRepository);
export const loginAuthPortalUsecase = new LoginAuthPortalUsecase(authPortalRepository);
export const registerAuthPortalUsecase = new RegisterAuthPortalUsecase(authPortalRepository);
export const logoutAuthPortalUsecase = new LogoutAuthPortalUsecase(authPortalRepository);
