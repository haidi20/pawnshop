import type { CustomerDataModel } from '@feature/customer/domain/models';
import type { CustomerRepository } from '@feature/customer/domain/repositories/customer.repository';

export class GetCustomerDataUsecase {
    constructor(private readonly repository: CustomerRepository) {}

    async execute(): Promise<CustomerDataModel> {
        return this.repository.getData();
    }
}
