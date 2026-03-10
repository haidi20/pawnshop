import { AuthAccessLocalDatasource } from '@feature/auth_access/data/datasources/auth_access_local_datasource';
import { AuthAccessRepositoryImpl } from '@feature/auth_access/data/repositories/auth_access_repository_impl';
import { GetAuthAccessDataUsecase } from '@feature/auth_access/domain/usecases/get_auth_access_data.usecase';

const authAccessLocalDatasource = new AuthAccessLocalDatasource();
const authAccessRepository = new AuthAccessRepositoryImpl(authAccessLocalDatasource);

export const getAuthAccessDataUsecase = new GetAuthAccessDataUsecase(authAccessRepository);
