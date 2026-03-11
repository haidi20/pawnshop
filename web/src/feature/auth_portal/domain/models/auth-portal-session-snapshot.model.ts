import type { AuthPortalUserRoleModel } from '@feature/auth_portal/domain/models/auth-portal-user-role.model';

export interface AuthPortalSessionSnapshotModel {
    sessionToken: string;
    loginAt: string;
    user: {
        id: number;
        companyId: number;
        role: AuthPortalUserRoleModel;
        fullName: string;
        username: string;
        email: string | null;
        phoneNumber: string | null;
    };
    company: {
        id: number;
        name: string;
        legalName: string | null;
        businessType: string | null;
        email: string | null;
        phoneNumber: string | null;
        city: string | null;
        address: string | null;
    };
}
