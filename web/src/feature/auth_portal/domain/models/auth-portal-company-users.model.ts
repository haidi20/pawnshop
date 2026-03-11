import type { AuthPortalUserRoleModel } from '@feature/auth_portal/domain/models/auth-portal-user-role.model';

export interface AuthPortalCompanyBranchOptionModel {
    id: number;
    branchCode: string;
    branchName: string;
}

export interface AuthPortalCompanyUserItemModel {
    id: number;
    role: AuthPortalUserRoleModel;
    fullName: string;
    username: string;
    email: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    assignedBranchId: number | null;
    assignedBranchName: string | null;
}

export interface AuthPortalCompanyUsersDataModel {
    companyId: number;
    companyName: string;
    users: AuthPortalCompanyUserItemModel[];
    branches: AuthPortalCompanyBranchOptionModel[];
}
