import { PawnTransactionLocalDatasource } from '@feature/pawn_transaction/data/datasources/pawn_transaction_local_datasource';
import { PawnTransactionRepositoryImpl } from '@feature/pawn_transaction/data/repositories/pawn_transaction_repository_impl';
import { GetPawnTransactionDataUsecase } from '@feature/pawn_transaction/domain/usecases/get_pawn_transaction_data.usecase';

const pawnTransactionLocalDatasource = new PawnTransactionLocalDatasource();
const pawnTransactionRepository = new PawnTransactionRepositoryImpl(pawnTransactionLocalDatasource);

export const getPawnTransactionDataUsecase = new GetPawnTransactionDataUsecase(pawnTransactionRepository);
