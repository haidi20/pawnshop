export type AuthPortalSessionStatusModel = 'active' | 'closed';

export interface AuthPortalSessionModel {
    id: number;
    companyId: number;
    userId: number;
    sessionToken: string;
    loginAt: string;
    logoutAt: string | null;
    sessionStatus: AuthPortalSessionStatusModel;
    createdAt: string | null;
    updatedAt: string | null;
}
