import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { customersDao, customerDocumentsDao, customerContactsDao } from '@feature/customer/data/db';
import { createCustomerDataFromRows } from '@feature/customer/data/mappers/customer.mapper';
import type { CustomerDataModel } from '@feature/customer/domain/models';

export class CustomerLocalDatasource {
    async getData(): Promise<CustomerDataModel> {
        const [
            customersRows,
            customerDocumentsRows,
            customerContactsRows
        ] = await Promise.all([
            customersDao.getAll(),
            customerDocumentsDao.getAll(),
            customerContactsDao.getAll()
        ]);

        return createCustomerDataFromRows({
            module: getAppModuleByKey('customer'),
            customersRows,
            customerDocumentsRows,
            customerContactsRows,
        });
    }
}
