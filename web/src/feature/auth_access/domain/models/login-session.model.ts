import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

export type LoginSessionSessionStatusModel =
    'active' |
    'closed' |
    'expired';

export const loginSessionSessionStatusLabelMap: Record<LoginSessionSessionStatusModel, string> = {
    'active': 'Aktif',
    'closed': 'Ditutup',
    'expired': 'Kedaluwarsa',
};

export const loginSessionSessionStatusOptions: EnumOptionModel<LoginSessionSessionStatusModel>[] = [
    { value: 'active', label: loginSessionSessionStatusLabelMap['active'] },
    { value: 'closed', label: loginSessionSessionStatusLabelMap['closed'] },
    { value: 'expired', label: loginSessionSessionStatusLabelMap['expired'] },
];

export interface LoginSessionModel {
    id: number;
    userId: number | null;
    sessionToken: string;
    ipAddress: string | null;
    userAgent: string | null;
    loginAt: string;
    logoutAt: string | null;
    sessionStatus: LoginSessionSessionStatusModel;
    createdAt: string | null;
    updatedAt: string | null;
}
