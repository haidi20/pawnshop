import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { customersTable, type CustomersRow } from '@feature/customer/data/db/customers.table';

export class CustomersDao extends FeatureTableDao<CustomersRow> {
    constructor() {
        super(customersTable);
    }
}

export const customersDao = new CustomersDao();
