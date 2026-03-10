import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { customersDao, customerDocumentsDao, customerContactsDao } from '@feature/customer/data/db';
import { CustomerLocalDatasource } from '@feature/customer/data/datasources/customer_local_datasource';
import type { CustomerDataModel } from '@feature/customer/domain/models';
import type { CustomerRepository } from '@feature/customer/domain/repositories/customer.repository';

export class CustomerRepositoryImpl implements CustomerRepository {
    constructor(private readonly localDataSource: CustomerLocalDatasource) {}

    async getData(): Promise<CustomerDataModel> {
        await seedFeatureTablesIfEmpty('CustomerRepositoryImpl', [
            customersDao,
            customerDocumentsDao,
            customerContactsDao
        ]);

        return this.localDataSource.getData();
    }
}
