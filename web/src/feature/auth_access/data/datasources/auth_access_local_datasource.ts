import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { rolesDao, usersDao, userRolesDao, userBranchAssignmentsDao, loginSessionsDao } from '@feature/auth_access/data/db';
import { createAuthAccessDataFromRows } from '@feature/auth_access/data/mappers/auth_access.mapper';
import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';

export class AuthAccessLocalDatasource {
    async getData(): Promise<AuthAccessDataModel> {
        const [
            rolesRows,
            usersRows,
            userRolesRows,
            userBranchAssignmentsRows,
            loginSessionsRows
        ] = await Promise.all([
            rolesDao.getAll(),
            usersDao.getAll(),
            userRolesDao.getAll(),
            userBranchAssignmentsDao.getAll(),
            loginSessionsDao.getAll()
        ]);

        return createAuthAccessDataFromRows({
            module: getAppModuleByKey('auth-access'),
            rolesRows,
            usersRows,
            userRolesRows,
            userBranchAssignmentsRows,
            loginSessionsRows,
        });
    }
}
