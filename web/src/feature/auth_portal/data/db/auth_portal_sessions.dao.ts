import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { authPortalSessionsTable, type AuthPortalSessionsRow } from '@feature/auth_portal/data/db/auth_portal_sessions.table';

export class AuthPortalSessionsDao extends FeatureTableDao<AuthPortalSessionsRow> {
    constructor() {
        super(authPortalSessionsTable);
    }
}

export const authPortalSessionsDao = new AuthPortalSessionsDao();
