import type {
    AuthPortalSessionSnapshotModel,
    AuthPortalUserRoleModel
} from '@feature/auth_portal/domain/models';
import { authPortalDemoCompanies } from '@feature/auth_portal/util/auth_portal_demo_accounts';

const AUTH_PORTAL_SESSION_STORAGE_KEY = 'pawnshop.auth_portal.session';
const AUTH_PORTAL_GLOBAL_STORAGE_SCOPE = 'global';
const LOCAL_DB_STORAGE_KEY_PREFIX = 'pawnshop.localdb.';

export const readAuthPortalStoredSession = (): AuthPortalSessionSnapshotModel | null => {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    const rawValue = localStorage.getItem(AUTH_PORTAL_SESSION_STORAGE_KEY);
    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue) as AuthPortalSessionSnapshotModel;
    } catch (error) {
        console.warn('[auth_portal] Failed to parse stored session.', error);
        return null;
    }
};

export const writeAuthPortalStoredSession = (session: AuthPortalSessionSnapshotModel): void => {
    if (typeof localStorage === 'undefined') {
        return;
    }

    localStorage.setItem(AUTH_PORTAL_SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthPortalStoredSession = (): void => {
    if (typeof localStorage === 'undefined') {
        return;
    }

    localStorage.removeItem(AUTH_PORTAL_SESSION_STORAGE_KEY);
};

export const hasAuthPortalStoredSession = (): boolean => readAuthPortalStoredSession() !== null;

export const getCurrentAuthPortalCompanyId = (): number | null =>
    readAuthPortalStoredSession()?.company.id ?? null;

export const isAuthPortalDemoCompanyId = (companyId: number | null): boolean =>
    companyId !== null && companyId >= 1 && companyId <= authPortalDemoCompanies.length;

export const isCurrentAuthPortalDemoCompany = (): boolean =>
    isAuthPortalDemoCompanyId(getCurrentAuthPortalCompanyId());

export const canAuthPortalUserAccessAllBranches = (
    role: AuthPortalUserRoleModel | null | undefined
): boolean => role === 'owner';

export const canCurrentAuthPortalAccessAllBranches = (): boolean =>
    canAuthPortalUserAccessAllBranches(readAuthPortalStoredSession()?.user.role);

export const getCurrentAuthPortalAssignedBranchId = (): number | null =>
    readAuthPortalStoredSession()?.user.assignedBranchId ?? null;

export const getCurrentAuthPortalAssignedBranchName = (): string | null =>
    readAuthPortalStoredSession()?.user.assignedBranchName ?? null;

export const isCurrentAuthPortalOwner = (): boolean =>
    readAuthPortalStoredSession()?.user.role === 'owner';

export const getCurrentAuthPortalBranchAccess = (): {
    canAccessAllBranches: boolean;
    assignedBranchId: number | null;
    assignedBranchName: string | null;
} => {
    const session = readAuthPortalStoredSession();

    return {
        canAccessAllBranches: canAuthPortalUserAccessAllBranches(session?.user.role),
        assignedBranchId: session?.user.assignedBranchId ?? null,
        assignedBranchName: session?.user.assignedBranchName ?? null
    };
};

export const readCompanyAssignedBranchName = (
    companyId: number,
    branchId: number | null
): string | null => {
    if (typeof localStorage === 'undefined' || branchId === null) {
        return null;
    }

    const storageKey = `${LOCAL_DB_STORAGE_KEY_PREFIX}company_${companyId}.branches`;
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
        return null;
    }

    try {
        const rows = JSON.parse(rawValue) as Array<{ id: number; branch_name: string }>;
        return rows.find((row) => row.id === branchId)?.branch_name ?? null;
    } catch (error) {
        console.warn('[auth_portal] Failed to parse company branches from local storage.', error);
        return null;
    }
};

export const getFeatureStorageScope = (featureKey: string): string => {
    if (featureKey === 'auth-portal') {
        return AUTH_PORTAL_GLOBAL_STORAGE_SCOPE;
    }

    const companyId = getCurrentAuthPortalCompanyId();
    return companyId === null ? 'public' : `company_${companyId}`;
};
