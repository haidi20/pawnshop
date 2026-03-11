import { beforeEach, describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { right } from 'fp-ts/Either';

import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';
import { masterBranchViewModel } from '@feature/master_branch/presentation/view_models/master_branch.vm';
import {
    deleteMasterBranchUsecase,
    deleteMasterLocationUsecase,
    getMasterBranchDataUsecase,
    saveMasterBranchUsecase,
    saveMasterLocationUsecase
} from '@feature/master_branch/presentation/di/master_branch.di';

vi.mock('@feature/master_branch/presentation/di/master_branch.di', () => ({
    getMasterBranchDataUsecase: {
        execute: vi.fn()
    },
    saveMasterBranchUsecase: {
        execute: vi.fn()
    },
    deleteMasterBranchUsecase: {
        execute: vi.fn()
    },
    saveMasterLocationUsecase: {
        execute: vi.fn()
    },
    deleteMasterLocationUsecase: {
        execute: vi.fn()
    }
}));

describe('master_branch view model', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    test('loads branch and location summary into table state', async () => {
        vi.mocked(getMasterBranchDataUsecase.execute).mockResolvedValue(right(createFixtureData()));

        const store = masterBranchViewModel();

        await store.getMasterBranchData();
        await nextTick();

        expect(store.totalBranchCount).toBe(2);
        expect(store.activeBranchCount).toBe(1);
        expect(store.inactiveBranchCount).toBe(1);
        expect(store.totalLocationCount).toBe(2);
        expect(store.activeLocationCount).toBe(1);
        expect(store.linkedBranchCount).toBe(2);
        expect(store.branchRowCount).toBe(2);
        expect(store.locationRowCount).toBe(2);
        expect(store.branchOptions).toHaveLength(2);
    });

    test('opens edit branch modal with current branch data', async () => {
        vi.mocked(getMasterBranchDataUsecase.execute).mockResolvedValue(right(createFixtureData()));

        const store = masterBranchViewModel();

        await store.getMasterBranchData();
        store.openEditBranchModal(10);

        expect(store.branchDialogMode).toBe('edit');
        expect(store.branchForm.id).toBe(10);
        expect(store.branchForm.branchCode).toBe('BR-SMD-001');
        expect(store.branchForm.branchName).toBe('Pawnshop Samarinda Kota');
        expect(store.branchForm.isActive).toBe(true);
    });

    test('saves branch form and reloads master branch data', async () => {
        vi.mocked(getMasterBranchDataUsecase.execute)
            .mockResolvedValueOnce(right(createFixtureData()))
            .mockResolvedValueOnce(right(createFixtureData()));
        vi.mocked(saveMasterBranchUsecase.execute).mockResolvedValue(right(undefined));

        const store = masterBranchViewModel();

        await store.getMasterBranchData();
        store.openCreateBranchModal();
        store.branchForm.branchCode = 'BR-BPP-003';
        store.branchForm.branchNumber = '003';
        store.branchForm.branchName = 'Pawnshop Balikpapan Barat';
        store.branchForm.phoneNumber = '0542-880303';
        store.branchForm.address = 'Jl. Ruhui Rahayu No. 8';
        store.branchForm.isActive = true;

        await store.saveBranch();

        expect(saveMasterBranchUsecase.execute).toHaveBeenCalledWith({
            branchCode: 'BR-BPP-003',
            branchNumber: '003',
            branchName: 'Pawnshop Balikpapan Barat',
            phoneNumber: '0542-880303',
            address: 'Jl. Ruhui Rahayu No. 8',
            isActive: true
        });
        expect(store.branchDialogMode).toBeNull();
        expect(getMasterBranchDataUsecase.execute).toHaveBeenCalledTimes(2);
    });

    test('saves location and deletes location with data refresh', async () => {
        vi.mocked(getMasterBranchDataUsecase.execute)
            .mockResolvedValueOnce(right(createFixtureData()))
            .mockResolvedValueOnce(right(createFixtureData()))
            .mockResolvedValueOnce(right(createFixtureData()));
        vi.mocked(saveMasterLocationUsecase.execute).mockResolvedValue(right(undefined));
        vi.mocked(deleteMasterLocationUsecase.execute).mockResolvedValue(right(undefined));

        const store = masterBranchViewModel();

        await store.getMasterBranchData();
        store.openCreateLocationModal();
        store.locationForm.branchId = '10';
        store.locationForm.locationCode = 'SAFE-SMD';
        store.locationForm.locationName = 'Ruang Safe Samarinda';
        store.locationForm.locationType = 'Safe Room';
        store.locationForm.isActive = true;

        await store.saveLocation();
        await store.deleteLocation(100);

        expect(saveMasterLocationUsecase.execute).toHaveBeenCalledWith({
            branchId: 10,
            locationCode: 'SAFE-SMD',
            locationName: 'Ruang Safe Samarinda',
            locationType: 'Safe Room',
            isActive: true
        });
        expect(deleteMasterLocationUsecase.execute).toHaveBeenCalledWith(100);
        expect(getMasterBranchDataUsecase.execute).toHaveBeenCalledTimes(3);
    });

    test('deletes branch and refreshes data', async () => {
        vi.mocked(getMasterBranchDataUsecase.execute)
            .mockResolvedValueOnce(right(createFixtureData()))
            .mockResolvedValueOnce(right(createFixtureData()));
        vi.mocked(deleteMasterBranchUsecase.execute).mockResolvedValue(right(undefined));

        const store = masterBranchViewModel();

        await store.getMasterBranchData();
        await store.deleteBranch(11);

        expect(deleteMasterBranchUsecase.execute).toHaveBeenCalledWith(11);
        expect(getMasterBranchDataUsecase.execute).toHaveBeenCalledTimes(2);
    });
});

function createFixtureData(): MasterBranchDataModel {
    return {
        module: {
            key: 'master-branch',
            title: 'Master Cabang',
            shortTitle: 'Cabang',
            route: '/branches',
            icon: 'bi-diagram-3-fill',
            phase: 'Fase 1',
            status: 'foundation_ready',
            summary: 'Kelola cabang.',
            goals: [],
            mainTables: ['branches', 'storage_locations'],
            childResources: ['storage_locations'],
            entities: [],
            nextSteps: []
        },
        branches: [
            {
                id: 10,
                branchCode: 'BR-SMD-001',
                branchNumber: '001',
                branchName: 'Pawnshop Samarinda Kota',
                phoneNumber: '0541-810001',
                address: 'Jl. Pahlawan No. 1',
                isActive: true,
                createdAt: null,
                updatedAt: null
            },
            {
                id: 11,
                branchCode: 'BR-BPP-002',
                branchNumber: '002',
                branchName: 'Pawnshop Balikpapan Selatan',
                phoneNumber: '0542-810002',
                address: 'Jl. MT Haryono No. 2',
                isActive: false,
                createdAt: null,
                updatedAt: null
            }
        ],
        storageLocations: [
            {
                id: 100,
                branchId: 10,
                locationCode: 'OFF-SMD',
                locationName: 'Kantor Samarinda',
                locationType: 'Kantor',
                isActive: true,
                createdAt: null,
                updatedAt: null
            },
            {
                id: 101,
                branchId: 11,
                locationCode: 'GDG-BPP',
                locationName: 'Gudang Balikpapan',
                locationType: 'Gudang',
                isActive: false,
                createdAt: null,
                updatedAt: null
            }
        ],
        tableCounts: [
            { key: 'branches', label: 'Cabang', count: 2 },
            { key: 'storage_locations', label: 'Lokasi penyimpanan', count: 2 }
        ],
        totalRows: 4
    };
}
