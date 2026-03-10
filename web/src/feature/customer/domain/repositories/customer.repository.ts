import type { CustomerDataModel } from '@feature/customer/domain/models';

export interface CustomerRepository {
    getData(): Promise<CustomerDataModel>;
}
