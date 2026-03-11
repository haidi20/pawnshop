    import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { authPortalCompaniesTable, type AuthPortalCompaniesRow } from '@feature/auth_portal/data/db/auth_portal_companies.table';

export class AuthPortalCompaniesDao extends FeatureTableDao<AuthPortalCompaniesRow> {
    constructor() {
        super(authPortalCompaniesTable);
    }
}

export const authPortalCompaniesDao = new AuthPortalCompaniesDao();
