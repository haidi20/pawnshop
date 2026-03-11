import type { Either } from 'fp-ts/Either';
import type { CustomerDataModel } from '@feature/customer/domain/models';

export interface CustomerRepository {
    getData(): Promise<Either<Error, CustomerDataModel>>;
}
