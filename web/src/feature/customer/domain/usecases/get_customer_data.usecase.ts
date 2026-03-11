import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { CustomerDataModel } from '@feature/customer/domain/models';
import type { CustomerRepository } from '@feature/customer/domain/repositories/customer.repository';

export class GetCustomerDataUsecase {
    constructor(private readonly repository: CustomerRepository) {}

    async execute(): Promise<Either<Error, CustomerDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
