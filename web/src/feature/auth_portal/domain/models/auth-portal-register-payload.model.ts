import type { AuthPortalUserRoleModel } from '@feature/auth_portal/domain/models/auth-portal-user-role.model';

export interface AuthPortalRegisterEmployeePayloadModel {
    fullName: string;
    username: string;
    email: string | null;
    phoneNumber: string | null;
    role: Exclude<AuthPortalUserRoleModel, 'owner'>;
    password: string;
}

export interface AuthPortalRegisterPayloadModel {
    ownerFullName: string;
    ownerUsername: string;
    ownerEmail: string;
    ownerPhoneNumber: string | null;
    password: string;
    companyName: string;
    legalName: string | null;
    businessType: string | null;
    companyEmail: string | null;
    companyPhoneNumber: string | null;
    city: string | null;
    address: string | null;
    employees: AuthPortalRegisterEmployeePayloadModel[];
}
