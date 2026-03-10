import { SupportLocalDatasource } from '@feature/support/data/datasources/support_local_datasource';
import { SupportRepositoryImpl } from '@feature/support/data/repositories/support_repository_impl';
import { GetSupportDataUsecase } from '@feature/support/domain/usecases/get_support_data.usecase';

const supportLocalDatasource = new SupportLocalDatasource();
const supportRepository = new SupportRepositoryImpl(supportLocalDatasource);

export const getSupportDataUsecase = new GetSupportDataUsecase(supportRepository);
