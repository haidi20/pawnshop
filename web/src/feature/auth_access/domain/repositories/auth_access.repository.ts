import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';

export interface AuthAccessRepository {
    getData(): Promise<AuthAccessDataModel>;
}
