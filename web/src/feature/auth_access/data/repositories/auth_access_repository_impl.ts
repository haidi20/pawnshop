import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { rolesDao, usersDao, userRolesDao, userBranchAssignmentsDao, loginSessionsDao } from '@feature/auth_access/data/db';
import { AuthAccessLocalDatasource } from '@feature/auth_access/data/datasources/auth_access_local_datasource';
import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';
import type { AuthAccessRepository } from '@feature/auth_access/domain/repositories/auth_access.repository';

export class AuthAccessRepositoryImpl implements AuthAccessRepository {
    constructor(private readonly localDataSource: AuthAccessLocalDatasource) {}

    async getData(): Promise<Either<Error, AuthAccessDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('AuthAccessRepositoryImpl', [
                rolesDao,
                usersDao,
                userRolesDao,
                userBranchAssignmentsDao,
                loginSessionsDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
