import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { rolesTable, type RolesRow } from '@feature/auth_access/data/db/roles.table';

export class RolesDao extends FeatureTableDao<RolesRow> {
    constructor() {
        super(rolesTable);
    }
}

export const rolesDao = new RolesDao();
