import { beforeEach, describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { right } from 'fp-ts/Either';

import type { AuthPortalCompanyUsersDataModel } from '@feature/auth_portal/domain/models';
import { authPortalUsersViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal_users.vm';
import {
    getAuthPortalCompanyUsersUsecase,
    updateAuthPortalUserBranchUsecase
} from '@feature/auth_portal/presentation/di/auth_portal.di';

vi.mock('@feature/auth_portal/presentation/di/auth_portal.di', () => ({
    getAuthPortalCompanyUsersUsecase: {
        execute: vi.fn()
    },
    updateAuthPortalUserBranchUsecase: {
        execute: vi.fn()
    }
}));

describe('auth_portal users view model', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    test('loads company users into actionable summary cards and searchable table state', async () => {
        vi.mocked(getAuthPortalCompanyUsersUsecase.execute).mockResolvedValue(right(createFixtureData()));

        const store = authPortalUsersViewModel();

        await store.loadData();
        await nextTick();

        expect(store.totalUserCount).toBe(3);
        expect(store.employeeCount).toBe(2);
        expect(store.assignedEmployeeCount).toBe(1);
        expect(store.unassignedEmployeeCount).toBe(1);
        expect(store.activeBranchCount).toBe(1);
        expect(store.pendingBranchChangeCount).toBe(0);
        expect(store.filteredUserCount).toBe(3);
        expect(store.branchDrafts[2]).toBe('10');
        expect(store.branchDrafts[3]).toBe('');
        expect(store.activeActionModalUser).toBeNull();
        expect(store.activeBranchModalUser).toBeNull();
        expect(store.getAssignmentState(store.userItems[2])).toMatchObject({
            statusLabel: 'Cabang belum diatur',
            tone: 'warning',
            needsAttention: true
        });

        store.dataTableVm.setSearch('nadia');
        store.dataTableVm.searchData();
        await nextTick();

        expect(store.filteredUserCount).toBe(1);
        expect(store.searchKeyword).toBe('nadia');
    });

    test('opens branch modal and cancels draft changes without mutating saved table state', async () => {
        vi.mocked(getAuthPortalCompanyUsersUsecase.execute).mockResolvedValue(right(createFixtureData()));

        const store = authPortalUsersViewModel();

        await store.loadData();
        await nextTick();

        store.openActionModal(3);
        await nextTick();

        expect(store.activeActionModalUser).toMatchObject({
            id: 3,
            fullName: 'Fajar Saputra'
        });
        expect(store.activeBranchModalUser).toBeNull();

        store.openBranchModalFromAction();
        await nextTick();

        expect(store.activeActionModalUser).toBeNull();
        expect(store.activeBranchModalUser).toMatchObject({
            id: 3,
            fullName: 'Fajar Saputra'
        });
        expect(store.branchDrafts[3]).toBe('');

        store.branchDrafts[3] = '11';
        await nextTick();

        expect(store.canSaveUser(3)).toBe(true);
        expect(store.pendingBranchChangeCount).toBe(1);
        expect(store.getDraftBranchLabel(3)).toBe('Pawnshop Balikpapan Selatan');
        expect(store.getBranchModalState(store.userItems[2])).toMatchObject({
            statusLabel: 'Cabang baru siap disimpan',
            draftBranchLabel: 'Pawnshop Balikpapan Selatan',
            tone: 'info',
            hasPendingChange: true
        });

        store.cancelBranchModal();
        await nextTick();

        expect(store.activeBranchModalUser).toBeNull();
        expect(store.branchDrafts[3]).toBe('');
        expect(store.canSaveUser(3)).toBe(false);
        expect(store.pendingBranchChangeCount).toBe(0);
        expect(store.getAssignmentState(store.userItems[2])).toMatchObject({
            statusLabel: 'Cabang belum diatur',
            currentBranchLabel: 'Belum diatur',
            needsAttention: true
        });
    });

    test('saves branch assignment from modal and syncs stored branch state back into the table', async () => {
        vi.mocked(getAuthPortalCompanyUsersUsecase.execute).mockResolvedValue(right(createFixtureData()));
        vi.mocked(updateAuthPortalUserBranchUsecase.execute).mockResolvedValue(right(undefined));

        const store = authPortalUsersViewModel();

        await store.loadData();
        await nextTick();

        store.openActionModal(3);
        store.openBranchModalFromAction();
        store.branchDrafts[3] = '11';
        await store.saveBranchFromModal();
        await nextTick();

        expect(updateAuthPortalUserBranchUsecase.execute).toHaveBeenCalledWith({
            userId: 3,
            branchId: 11
        });
        expect(store.activeActionModalUser).toBeNull();
        expect(store.userItems[2]).toMatchObject({
            assignedBranchId: 11,
            assignedBranchName: 'Pawnshop Balikpapan Selatan'
        });
        expect(store.activeBranchCount).toBe(2);
        expect(store.branchDrafts[3]).toBe('11');
        expect(store.activeBranchModalUser).toBeNull();
        expect(store.pendingBranchChangeCount).toBe(0);
        expect(store.canSaveUser(3)).toBe(false);
        expect(store.getAssignmentState(store.userItems[2])).toMatchObject({
            statusLabel: 'Cabang sinkron',
            currentBranchLabel: 'Pawnshop Balikpapan Selatan',
            needsAttention: false
        });
    });
});

function createFixtureData(): AuthPortalCompanyUsersDataModel {
    return {
        companyId: 99,
        companyName: 'PT Prima Jaminan',
        branches: [
            {
                id: 10,
                branchCode: 'BPP-KOTA',
                branchName: 'Pawnshop Balikpapan Kota',
                isActive: true
            },
            {
                id: 11,
                branchCode: 'BPP-SEL',
                branchName: 'Pawnshop Balikpapan Selatan',
                isActive: false
            }
        ],
        users: [
            {
                id: 1,
                role: 'owner',
                fullName: 'Dimas Rahardian',
                username: 'owner.pjs',
                email: 'owner@primajaminan.id',
                phoneNumber: '08125200201',
                isActive: true,
                assignedBranchId: null,
                assignedBranchName: null
            },
            {
                id: 2,
                role: 'admin',
                fullName: 'Nadia Puspita',
                username: 'admin.pjs',
                email: 'admin@primajaminan.id',
                phoneNumber: '08125200202',
                isActive: true,
                assignedBranchId: 10,
                assignedBranchName: 'Pawnshop Balikpapan Kota'
            },
            {
                id: 3,
                role: 'staff',
                fullName: 'Fajar Saputra',
                username: 'staff.pjs',
                email: 'staff@primajaminan.id',
                phoneNumber: '08125200203',
                isActive: true,
                assignedBranchId: null,
                assignedBranchName: null
            }
        ]
    };
}
