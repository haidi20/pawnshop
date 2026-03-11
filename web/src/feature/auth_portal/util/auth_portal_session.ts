import type { AuthPortalSessionSnapshotModel } from '@feature/auth_portal/domain/models';
import { authPortalDemoCompanies } from '@feature/auth_portal/util/auth_portal_demo_accounts';

const AUTH_PORTAL_SESSION_STORAGE_KEY = 'pawnshop.auth_portal.session';
const AUTH_PORTAL_GLOBAL_STORAGE_SCOPE = 'global';

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

export const getFeatureStorageScope = (featureKey: string): string => {
    if (featureKey === 'auth-portal') {
        return AUTH_PORTAL_GLOBAL_STORAGE_SCOPE;
    }

    const companyId = getCurrentAuthPortalCompanyId();
    return companyId === null ? 'public' : `company_${companyId}`;
};
