import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';

export interface IAuthAccessResponse {
    success: boolean;
    data: AuthAccessDataModel;
    message: string;
}
