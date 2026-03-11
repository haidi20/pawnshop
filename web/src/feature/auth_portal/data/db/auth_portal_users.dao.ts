import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { authPortalUsersTable, type AuthPortalUsersRow } from '@feature/auth_portal/data/db/auth_portal_users.table';

export class AuthPortalUsersDao extends FeatureTableDao<AuthPortalUsersRow> {
    constructor() {
        super(authPortalUsersTable);
    }
}

export const authPortalUsersDao = new AuthPortalUsersDao();
