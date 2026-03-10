import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { contractPaymentsDao, contractExtensionsDao, auctionTransactionsDao } from '@feature/pawn_transaction/data/db';
import { PawnTransactionLocalDatasource } from '@feature/pawn_transaction/data/datasources/pawn_transaction_local_datasource';
import type { PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';
import type { PawnTransactionRepository } from '@feature/pawn_transaction/domain/repositories/pawn_transaction.repository';

export class PawnTransactionRepositoryImpl implements PawnTransactionRepository {
    constructor(private readonly localDataSource: PawnTransactionLocalDatasource) {}

    async getData(): Promise<PawnTransactionDataModel> {
        await seedFeatureTablesIfEmpty('PawnTransactionRepositoryImpl', [
            contractPaymentsDao,
            contractExtensionsDao,
            auctionTransactionsDao
        ]);

        return this.localDataSource.getData();
    }
}
