import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import {
    pawnContractsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao,
    pawnItemsDao
} from '@feature/pawn_contract/data/db';
import { PawnContractLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_local_datasource';
import type { PawnContractDataModel } from '@feature/pawn_contract/domain/models';

export class PawnContractRepositoryImpl implements PawnContractRepository {
    constructor(private readonly localDataSource: PawnContractLocalDatasource) {}

    async getData(): Promise<PawnContractDataModel> {
        await seedFeatureTablesIfEmpty('PawnContractRepositoryImpl', [
            pawnContractsDao,
            pawnItemsDao,
            pawnItemAccessoriesDao,
            pawnItemIssuesDao,
            pawnItemLocationMovementsDao
        ]);

        return this.localDataSource.getData();
    }
}
