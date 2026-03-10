import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

export type CustomerGenderModel =
    'male' |
    'female';

export const customerGenderLabelMap: Record<CustomerGenderModel, string> = {
    'male': 'Laki-laki',
    'female': 'Perempuan',
};

export const customerGenderOptions: EnumOptionModel<CustomerGenderModel>[] = [
    { value: 'male', label: customerGenderLabelMap['male'] },
    { value: 'female', label: customerGenderLabelMap['female'] },
];

export type CustomerCustomerStatusModel =
    'active' |
    'inactive' |
    'blocked';

export const customerCustomerStatusLabelMap: Record<CustomerCustomerStatusModel, string> = {
    'active': 'Aktif',
    'inactive': 'Tidak aktif',
    'blocked': 'Diblokir',
};

export const customerCustomerStatusOptions: EnumOptionModel<CustomerCustomerStatusModel>[] = [
    { value: 'active', label: customerCustomerStatusLabelMap['active'] },
    { value: 'inactive', label: customerCustomerStatusLabelMap['inactive'] },
    { value: 'blocked', label: customerCustomerStatusLabelMap['blocked'] },
];

export interface CustomerModel {
    id: number;
    customerCode: string;
    fullName: string;
    gender: CustomerGenderModel;
    birthDate: string | null;
    city: string | null;
    address: string | null;
    customerStatus: CustomerCustomerStatusModel;
    createdAt: string | null;
    updatedAt: string | null;
}
