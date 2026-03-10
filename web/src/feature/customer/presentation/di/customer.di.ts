import { CustomerLocalDatasource } from '@feature/customer/data/datasources/customer_local_datasource';
import { CustomerRepositoryImpl } from '@feature/customer/data/repositories/customer_repository_impl';
import { GetCustomerDataUsecase } from '@feature/customer/domain/usecases/get_customer_data.usecase';

const customerLocalDatasource = new CustomerLocalDatasource();
const customerRepository = new CustomerRepositoryImpl(customerLocalDatasource);

export const getCustomerDataUsecase = new GetCustomerDataUsecase(customerRepository);
