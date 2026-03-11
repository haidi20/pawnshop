import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { contractPaymentsDao, contractExtensionsDao, auctionTransactionsDao } from '@feature/pawn_transaction/data/db';
import { PawnTransactionLocalDatasource } from '@feature/pawn_transaction/data/datasources/pawn_transaction_local_datasource';
import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';
import type { PawnTransactionRepository } from '@feature/pawn_transaction/domain/repositories/pawn_transaction.repository';

export class PawnTransactionRepositoryImpl implements PawnTransactionRepository {
    constructor(private readonly localDataSource: PawnTransactionLocalDatasource) {}

    async getData(): Promise<Either<Error, PawnTransactionDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('PawnTransactionRepositoryImpl', [
                contractPaymentsDao,
                contractExtensionsDao,
                auctionTransactionsDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
