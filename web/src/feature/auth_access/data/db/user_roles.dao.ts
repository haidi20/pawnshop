import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { userRolesTable, type UserRolesRow } from '@feature/auth_access/data/db/user_roles.table';

export class UserRolesDao extends FeatureTableDao<UserRolesRow> {
    constructor() {
        super(userRolesTable);
    }
}

export const userRolesDao = new UserRolesDao();
