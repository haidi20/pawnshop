import type { AuthPortalUserRoleModel } from '@feature/auth_portal/domain/models/auth-portal-user-role.model';

export interface AuthPortalUserModel {
    id: number;
    companyId: number;
    role: AuthPortalUserRoleModel;
    username: string;
    passwordHash: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
