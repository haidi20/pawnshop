import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { branchesDao, storageLocationsDao } from '@feature/master_branch/data/db';
import { MasterBranchLocalDatasource } from '@feature/master_branch/data/datasources/master_branch_local_datasource';
import type {
    MasterBranchDataModel,
    MasterBranchUpsertPayloadModel,
    MasterLocationUpsertPayloadModel
} from '@feature/master_branch/domain/models';
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

    async saveBranch(payload: MasterBranchUpsertPayloadModel): Promise<Either<Error, void>> {
        try {
            await this.localDataSource.saveBranch(payload);
            return right(undefined);
        } catch (error) {
            return left(toError(error));
        }
    }

    async deleteBranch(branchId: number): Promise<Either<Error, void>> {
        try {
            await this.localDataSource.deleteBranch(branchId);
            return right(undefined);
        } catch (error) {
            return left(toError(error));
        }
    }

    async saveLocation(payload: MasterLocationUpsertPayloadModel): Promise<Either<Error, void>> {
        try {
            await this.localDataSource.saveLocation(payload);
            return right(undefined);
        } catch (error) {
            return left(toError(error));
        }
    }

    async deleteLocation(locationId: number): Promise<Either<Error, void>> {
        try {
            await this.localDataSource.deleteLocation(locationId);
            return right(undefined);
        } catch (error) {
            return left(toError(error));
        }
    }
}
