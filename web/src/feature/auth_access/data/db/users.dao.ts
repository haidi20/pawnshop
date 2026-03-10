import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { usersTable, type UsersRow } from '@feature/auth_access/data/db/users.table';

export class UsersDao extends FeatureTableDao<UsersRow> {
    constructor() {
        super(usersTable);
    }
}

export const usersDao = new UsersDao();
