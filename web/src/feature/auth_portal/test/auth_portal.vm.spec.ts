import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { right } from 'fp-ts/Either';

import type { AuthPortalSessionSnapshotModel } from '@feature/auth_portal/domain/models';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';
import {
    updateAuthPortalCompanyUsecase,
    updateAuthPortalProfileUsecase
} from '@feature/auth_portal/presentation/di/auth_portal.di';

vi.mock('@feature/auth_portal/presentation/di/auth_portal.di', () => ({
    getCurrentAuthPortalSessionUsecase: {
        execute: vi.fn()
    },
    getAuthPortalCompanyUsersUsecase: {
        execute: vi.fn()
    },
    loginAuthPortalUsecase: {
        execute: vi.fn()
    },
    logoutAuthPortalUsecase: {
        execute: vi.fn()
    },
    registerAuthPortalUsecase: {
        execute: vi.fn()
    },
    updateAuthPortalCompanyUsecase: {
        execute: vi.fn()
    },
    updateAuthPortalProfileUsecase: {
        execute: vi.fn()
    },
    updateAuthPortalUserBranchUsecase: {
        execute: vi.fn()
    }
}));

describe('auth_portal view model', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    test('updates active company snapshot after saving company profile', async () => {
        const store = authPortalViewModel();
        const currentSession = createSessionSnapshot();
        const updatedSession = createSessionSnapshot({
            company: {
                ...currentSession.company,
                name: 'Sentra Gadai Baru',
                city: 'Balikpapan'
            }
        });

        store.currentSession = currentSession;
        vi.mocked(updateAuthPortalCompanyUsecase.execute).mockResolvedValue(right(updatedSession));

        const result = await store.updateCompany({
            name: 'Sentra Gadai Baru',
            legalName: currentSession.company.legalName,
            businessType: currentSession.company.businessType,
            email: currentSession.company.email,
            phoneNumber: currentSession.company.phoneNumber,
            city: 'Balikpapan',
            address: currentSession.company.address
        });

        expect(updateAuthPortalCompanyUsecase.execute).toHaveBeenCalledWith({
            name: 'Sentra Gadai Baru',
            legalName: currentSession.company.legalName,
            businessType: currentSession.company.businessType,
            email: currentSession.company.email,
            phoneNumber: currentSession.company.phoneNumber,
            city: 'Balikpapan',
            address: currentSession.company.address
        });
        expect(result.company.name).toBe('Sentra Gadai Baru');
        expect(store.currentSession?.company.name).toBe('Sentra Gadai Baru');
        expect(store.currentSession?.company.city).toBe('Balikpapan');
        expect(store.isSubmitting).toBe(false);
    });

    test('updates active user snapshot after saving personal profile', async () => {
        const store = authPortalViewModel();
        const currentSession = createSessionSnapshot();
        const updatedSession = createSessionSnapshot({
            user: {
                ...currentSession.user,
                fullName: 'Rina Permata',
                username: 'rina.permata',
                email: 'rina.permata@sentragadai.id',
                phoneNumber: '081299900011'
            }
        });

        store.currentSession = currentSession;
        vi.mocked(updateAuthPortalProfileUsecase.execute).mockResolvedValue(right(updatedSession));

        const result = await store.updateProfile({
            fullName: 'Rina Permata',
            username: 'rina.permata',
            email: 'rina.permata@sentragadai.id',
            phoneNumber: '081299900011'
        });

        expect(updateAuthPortalProfileUsecase.execute).toHaveBeenCalledWith({
            fullName: 'Rina Permata',
            username: 'rina.permata',
            email: 'rina.permata@sentragadai.id',
            phoneNumber: '081299900011'
        });
        expect(result.user.fullName).toBe('Rina Permata');
        expect(result.user.username).toBe('rina.permata');
        expect(store.currentSession?.user.fullName).toBe('Rina Permata');
        expect(store.currentSession?.user.username).toBe('rina.permata');
        expect(store.currentSession?.user.email).toBe('rina.permata@sentragadai.id');
        expect(store.currentSession?.user.phoneNumber).toBe('081299900011');
        expect(store.isSubmitting).toBe(false);
    });
});

function createSessionSnapshot(
    overrides: Partial<AuthPortalSessionSnapshotModel> = {}
): AuthPortalSessionSnapshotModel {
    return {
        sessionToken: 'token-1',
        loginAt: '2026-03-12T10:00:00.000Z',
        user: {
            id: 1,
            companyId: 1,
            role: 'owner',
            assignedBranchId: null,
            assignedBranchName: null,
            fullName: 'Rina Maharani',
            username: 'rina.owner',
            email: 'rina@sentragadai.id',
            phoneNumber: '08123456789'
        },
        company: {
            id: 1,
            name: 'Sentra Gadai Nusantara',
            legalName: 'PT Sentra Gadai Nusantara',
            businessType: 'Pegadaian Swasta',
            email: 'halo@sentragadai.id',
            phoneNumber: '0541-880101',
            city: 'Samarinda',
            address: 'Jl. Ahmad Yani No. 10'
        },
        ...overrides
    };
}
