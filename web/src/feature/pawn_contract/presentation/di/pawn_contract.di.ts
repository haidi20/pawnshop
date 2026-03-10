import { PawnContractLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_local_datasource';
import { PawnContractRepositoryImpl } from '@feature/pawn_contract/data/repositories/pawn_contract_repository_impl';
import { GetPawnContractDataUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_data.usecase';

const pawnContractLocalDatasource = new PawnContractLocalDatasource();
export const pawnContractRepository = new PawnContractRepositoryImpl(pawnContractLocalDatasource);

export const getPawnContractDataUsecase = new GetPawnContractDataUsecase(pawnContractRepository);
