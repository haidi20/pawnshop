import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { branchesDao, storageLocationsDao } from '@feature/master_branch/data/db';
import { MasterBranchLocalDatasource } from '@feature/master_branch/data/datasources/master_branch_local_datasource';
import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';
import type { MasterBranchRepository } from '@feature/master_branch/domain/repositories/master_branch.repository';

export class MasterBranchRepositoryImpl implements MasterBranchRepository {
    constructor(private readonly localDataSource: MasterBranchLocalDatasource) {}

    async getData(): Promise<Either<Error, MasterBranchDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('MasterBranchRepositoryImpl', [
                branchesDao,
                storageLocationsDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
