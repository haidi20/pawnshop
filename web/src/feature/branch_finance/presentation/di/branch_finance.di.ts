import { BranchFinanceLocalDatasource } from '@feature/branch_finance/data/datasources/branch_finance_local_datasource';
import { BranchFinanceRepositoryImpl } from '@feature/branch_finance/data/repositories/branch_finance_repository_impl';
import { GetBranchFinanceDataUsecase } from '@feature/branch_finance/domain/usecases/get_branch_finance_data.usecase';

const branchFinanceLocalDatasource = new BranchFinanceLocalDatasource();
const branchFinanceRepository = new BranchFinanceRepositoryImpl(branchFinanceLocalDatasource);

export const getBranchFinanceDataUsecase = new GetBranchFinanceDataUsecase(branchFinanceRepository);
