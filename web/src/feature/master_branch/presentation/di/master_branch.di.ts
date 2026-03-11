import { MasterBranchLocalDatasource } from '@feature/master_branch/data/datasources/master_branch_local_datasource';
import { MasterBranchRepositoryImpl } from '@feature/master_branch/data/repositories/master_branch_repository_impl';
import { DeleteMasterBranchUsecase } from '@feature/master_branch/domain/usecases/delete_master_branch.usecase';
import { DeleteMasterLocationUsecase } from '@feature/master_branch/domain/usecases/delete_master_location.usecase';
import { GetMasterBranchDataUsecase } from '@feature/master_branch/domain/usecases/get_master_branch_data.usecase';
import { SaveMasterBranchUsecase } from '@feature/master_branch/domain/usecases/save_master_branch.usecase';
import { SaveMasterLocationUsecase } from '@feature/master_branch/domain/usecases/save_master_location.usecase';

const masterBranchLocalDatasource = new MasterBranchLocalDatasource();
const masterBranchRepository = new MasterBranchRepositoryImpl(masterBranchLocalDatasource);

export const getMasterBranchDataUsecase = new GetMasterBranchDataUsecase(masterBranchRepository);
export const saveMasterBranchUsecase = new SaveMasterBranchUsecase(masterBranchRepository);
export const deleteMasterBranchUsecase = new DeleteMasterBranchUsecase(masterBranchRepository);
export const saveMasterLocationUsecase = new SaveMasterLocationUsecase(masterBranchRepository);
export const deleteMasterLocationUsecase = new DeleteMasterLocationUsecase(masterBranchRepository);
