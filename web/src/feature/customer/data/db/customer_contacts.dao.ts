import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { customerContactsTable, type CustomerContactsRow } from '@feature/customer/data/db/customer_contacts.table';

export class CustomerContactsDao extends FeatureTableDao<CustomerContactsRow> {
    constructor() {
        super(customerContactsTable);
    }
}

export const customerContactsDao = new CustomerContactsDao();
