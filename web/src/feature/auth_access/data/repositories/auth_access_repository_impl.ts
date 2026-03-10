import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { rolesDao, usersDao, userRolesDao, userBranchAssignmentsDao, loginSessionsDao } from '@feature/auth_access/data/db';
import { AuthAccessLocalDatasource } from '@feature/auth_access/data/datasources/auth_access_local_datasource';
import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';
import type { AuthAccessRepository } from '@feature/auth_access/domain/repositories/auth_access.repository';

export class AuthAccessRepositoryImpl implements AuthAccessRepository {
    constructor(private readonly localDataSource: AuthAccessLocalDatasource) {}

    async getData(): Promise<AuthAccessDataModel> {
        await seedFeatureTablesIfEmpty('AuthAccessRepositoryImpl', [
            rolesDao,
            usersDao,
            userRolesDao,
            userBranchAssignmentsDao,
            loginSessionsDao
        ]);

        return this.localDataSource.getData();
    }
}
