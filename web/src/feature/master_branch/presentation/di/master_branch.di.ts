import { MasterBranchLocalDatasource } from '@feature/master_branch/data/datasources/master_branch_local_datasource';
import { MasterBranchRepositoryImpl } from '@feature/master_branch/data/repositories/master_branch_repository_impl';
import { GetMasterBranchDataUsecase } from '@feature/master_branch/domain/usecases/get_master_branch_data.usecase';

const masterBranchLocalDatasource = new MasterBranchLocalDatasource();
const masterBranchRepository = new MasterBranchRepositoryImpl(masterBranchLocalDatasource);

export const getMasterBranchDataUsecase = new GetMasterBranchDataUsecase(masterBranchRepository);
