import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { loginSessionsTable, type LoginSessionsRow } from '@feature/auth_access/data/db/login_sessions.table';

export class LoginSessionsDao extends FeatureTableDao<LoginSessionsRow> {
    constructor() {
        super(loginSessionsTable);
    }
}

export const loginSessionsDao = new LoginSessionsDao();
