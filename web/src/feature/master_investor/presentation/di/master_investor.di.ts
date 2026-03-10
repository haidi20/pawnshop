import { MasterInvestorLocalDatasource } from '@feature/master_investor/data/datasources/master_investor_local_datasource';
import { MasterInvestorRepositoryImpl } from '@feature/master_investor/data/repositories/master_investor_repository_impl';
import { GetMasterInvestorDataUsecase } from '@feature/master_investor/domain/usecases/get_master_investor_data.usecase';

const masterInvestorLocalDatasource = new MasterInvestorLocalDatasource();
const masterInvestorRepository = new MasterInvestorRepositoryImpl(masterInvestorLocalDatasource);

export const getMasterInvestorDataUsecase = new GetMasterInvestorDataUsecase(masterInvestorRepository);
