import type { CustomerDataModel } from '@feature/customer/domain/models';

export interface ICustomerResponse {
    success: boolean;
    data: CustomerDataModel;
    message: string;
}
