import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { customerDocumentsTable, type CustomerDocumentsRow } from '@feature/customer/data/db/customer_documents.table';

export class CustomerDocumentsDao extends FeatureTableDao<CustomerDocumentsRow> {
    constructor() {
        super(customerDocumentsTable);
    }
}

export const customerDocumentsDao = new CustomerDocumentsDao();
