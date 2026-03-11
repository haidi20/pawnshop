import { computed, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';

import { DataTableClientSideService } from '@core/presentation/services/datatable_clientside.service';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import { unwrapEitherOrThrow } from '@core/util/either';
import type {
    BranchModel,
    MasterBranchUpsertPayloadModel,
    MasterLocationUpsertPayloadModel,
    StorageLocationModel
} from '@feature/master_branch/domain/models';
import {
    deleteMasterBranchUsecase,
    deleteMasterLocationUsecase,
    getMasterBranchDataUsecase,
    saveMasterBranchUsecase,
    saveMasterLocationUsecase
} from '@feature/master_branch/presentation/di/master_branch.di';
import { masterBranchState } from '@feature/master_branch/presentation/view_models/master_branch.state';

type MasterDataDialogMode = 'create' | 'edit' | null;
type MasterDataStatusTone = 'active' | 'inactive';

interface MasterBranchFormState {
    id: number | null;
    branchCode: string;
    branchNumber: string;
    branchName: string;
    phoneNumber: string;
    address: string;
    isActive: boolean;
}

interface MasterLocationFormState {
    id: number | null;
    branchId: string;
    locationCode: string;
    locationName: string;
    locationType: string;
    isActive: boolean;
}

export interface MasterBranchTableRow {
    id: number;
    source: BranchModel;
    actionLabel: string;
    branchCode: string;
    branchNumberLabel: string;
    branchName: string;
    addressLabel: string;
    phoneNumberLabel: string;
    statusLabel: string;
    statusTone: MasterDataStatusTone;
    searchText: string;
}

export interface MasterLocationTableRow {
    id: number;
    source: StorageLocationModel;
    actionLabel: string;
    branchLabel: string;
    branchCodeLabel: string;
    locationCode: string;
    locationName: string;
    locationType: string;
    statusLabel: string;
    statusTone: MasterDataStatusTone;
    searchText: string;
}

export interface MasterBranchOptionItem {
    id: string;
    label: string;
    isActive: boolean;
}

const branchTableFields = [
    { key: 'actionLabel', label: 'Aksi', thClass: 'master-data-page__col-action' },
    { key: 'branchCode', label: 'Kode Cabang', thClass: 'master-data-page__col-code' },
    { key: 'branchNumberLabel', label: 'Nomor Cabang', thClass: 'master-data-page__col-number' },
    { key: 'branchName', label: 'Nama Cabang', thClass: 'master-data-page__col-name' },
    { key: 'phoneNumberLabel', label: 'Nomor Telepon', thClass: 'master-data-page__col-phone' },
    { key: 'statusLabel', label: 'Status Aktif', thClass: 'master-data-page__col-status' }
] as const;

const locationTableFields = [
    { key: 'actionLabel', label: 'Aksi', thClass: 'master-data-page__col-action' },
    { key: 'branchLabel', label: 'Cabang', thClass: 'master-data-page__col-name' },
    { key: 'locationCode', label: 'Kode Lokasi', thClass: 'master-data-page__col-code' },
    { key: 'locationName', label: 'Nama Lokasi', thClass: 'master-data-page__col-name' },
    { key: 'locationType', label: 'Tipe Lokasi', thClass: 'master-data-page__col-type' },
    { key: 'statusLabel', label: 'Status Aktif', thClass: 'master-data-page__col-status' }
] as const;

const emptyBranchForm = (): MasterBranchFormState => ({
    id: null,
    branchCode: '',
    branchNumber: '',
    branchName: '',
    phoneNumber: '',
    address: '',
    isActive: true
});

const emptyLocationForm = (): MasterLocationFormState => ({
    id: null,
    branchId: '',
    locationCode: '',
    locationName: '',
    locationType: '',
    isActive: true
});

export const masterBranchViewModel = defineStore('masterBranchStore', () => {
    const state = masterBranchState();
    const branchDialogMode = ref<MasterDataDialogMode>(null);
    const locationDialogMode = ref<MasterDataDialogMode>(null);
    const isSavingBranch = ref(false);
    const isSavingLocation = ref(false);
    const isDeletingBranchIds = ref<number[]>([]);
    const isDeletingLocationIds = ref<number[]>([]);
    const branchForm = reactive<MasterBranchFormState>(emptyBranchForm());
    const locationForm = reactive<MasterLocationFormState>(emptyLocationForm());
    const branchTableService = new DataTableClientSideService<MasterBranchTableRow>([...branchTableFields], []);
    const locationTableService = new DataTableClientSideService<MasterLocationTableRow>([...locationTableFields], []);

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const formatValue = (value: string | null | undefined): string => {
        const normalizedValue = value?.trim();
        return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '-';
    };

    const branchMap = computed(() => new Map((state.data.value?.branches ?? []).map((branch) => [branch.id, branch])));
    const totalBranchCount = computed(() => state.data.value?.branches.length ?? 0);
    const activeBranchCount = computed(() => state.data.value?.branches.filter((branch) => branch.isActive).length ?? 0);
    const inactiveBranchCount = computed(() => totalBranchCount.value - activeBranchCount.value);
    const totalLocationCount = computed(() => state.data.value?.storageLocations.length ?? 0);
    const activeLocationCount = computed(
        () => state.data.value?.storageLocations.filter((location) => location.isActive).length ?? 0
    );
    const linkedBranchCount = computed(
        () =>
            new Set(
                (state.data.value?.storageLocations ?? [])
                    .map((location) => location.branchId)
                    .filter((branchId): branchId is number => typeof branchId === 'number')
            ).size
    );
    const branchOptions = computed<MasterBranchOptionItem[]>(() =>
        [...(state.data.value?.branches ?? [])]
            .sort((left, right) => left.branchName.localeCompare(right.branchName, 'id-ID'))
            .map((branch) => ({
                id: String(branch.id),
                label: branch.isActive ? branch.branchName : `${branch.branchName} (Belum aktif)`,
                isActive: branch.isActive
            }))
    );

    const mapBranchRow = (branch: BranchModel): MasterBranchTableRow => ({
        id: branch.id,
        source: branch,
        actionLabel: 'Aksi',
        branchCode: branch.branchCode,
        branchNumberLabel: formatValue(branch.branchNumber),
        branchName: branch.branchName,
        addressLabel: formatValue(branch.address),
        phoneNumberLabel: formatValue(branch.phoneNumber),
        statusLabel: branch.isActive ? 'Aktif' : 'Belum aktif',
        statusTone: branch.isActive ? 'active' : 'inactive',
        searchText: [
            branch.branchCode,
            branch.branchNumber,
            branch.branchName,
            branch.phoneNumber,
            branch.address,
            branch.isActive ? 'Aktif' : 'Belum aktif'
        ]
            .filter(Boolean)
            .join(' ')
    });

    const mapLocationRow = (location: StorageLocationModel): MasterLocationTableRow => {
        const branch = location.branchId !== null ? branchMap.value.get(location.branchId) ?? null : null;

        return {
            id: location.id,
            source: location,
            actionLabel: 'Aksi',
            branchLabel: branch?.branchName ?? 'Cabang tidak ditemukan',
            branchCodeLabel: branch?.branchCode ?? '-',
            locationCode: location.locationCode,
            locationName: location.locationName,
            locationType: location.locationType,
            statusLabel: location.isActive ? 'Aktif' : 'Belum aktif',
            statusTone: location.isActive ? 'active' : 'inactive',
            searchText: [
                branch?.branchName,
                branch?.branchCode,
                location.locationCode,
                location.locationName,
                location.locationType,
                location.isActive ? 'Aktif' : 'Belum aktif'
            ]
                .filter(Boolean)
                .join(' ')
        };
    };

    const branchRows = computed(() =>
        [...(state.data.value?.branches ?? [])]
            .sort((left, right) => left.branchName.localeCompare(right.branchName, 'id-ID'))
            .map(mapBranchRow)
    );

    const locationRows = computed(() =>
        [...(state.data.value?.storageLocations ?? [])]
            .sort((left, right) => left.locationName.localeCompare(right.locationName, 'id-ID'))
            .map(mapLocationRow)
    );

    const branchRowCount = computed(() => branchTableService.vm.totalItems as number);
    const locationRowCount = computed(() => locationTableService.vm.totalItems as number);
    const branchSearchKeyword = computed(() => String(branchTableService.vm.search ?? '').trim());
    const locationSearchKeyword = computed(() => String(locationTableService.vm.search ?? '').trim());
    const isBranchDialogOpen = computed(() => branchDialogMode.value !== null);
    const isLocationDialogOpen = computed(() => locationDialogMode.value !== null);
    const branchDialogTitle = computed(() =>
        branchDialogMode.value === 'edit' ? 'Ubah cabang' : 'Tambah cabang'
    );
    const locationDialogTitle = computed(() =>
        locationDialogMode.value === 'edit' ? 'Ubah lokasi' : 'Tambah lokasi'
    );

    const assignBranchForm = (branch: BranchModel | null = null): void => {
        const nextState = branch
            ? {
                id: branch.id,
                branchCode: branch.branchCode,
                branchNumber: branch.branchNumber ?? '',
                branchName: branch.branchName,
                phoneNumber: branch.phoneNumber ?? '',
                address: branch.address ?? '',
                isActive: branch.isActive
            }
            : emptyBranchForm();

        Object.assign(branchForm, nextState);
    };

    const assignLocationForm = (location: StorageLocationModel | null = null): void => {
        const nextState = location
            ? {
                id: location.id,
                branchId: location.branchId !== null ? String(location.branchId) : '',
                locationCode: location.locationCode,
                locationName: location.locationName,
                locationType: location.locationType,
                isActive: location.isActive
            }
            : emptyLocationForm();

        Object.assign(locationForm, nextState);
    };

    const getBranchById = (branchId: number): BranchModel | null =>
        state.data.value?.branches.find((item) => item.id === branchId) ?? null;

    const getLocationById = (locationId: number): StorageLocationModel | null =>
        state.data.value?.storageLocations.find((item) => item.id === locationId) ?? null;

    const getMasterBranchData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            state.data.value = unwrapEitherOrThrow(await getMasterBranchDataUsecase.execute());
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    const openCreateBranchModal = (): void => {
        assignBranchForm();
        branchDialogMode.value = 'create';
        setError(null);
    };

    const openEditBranchModal = (branchId: number): void => {
        const branch = getBranchById(branchId);
        if (!branch) {
            return;
        }

        assignBranchForm(branch);
        branchDialogMode.value = 'edit';
        setError(null);
    };

    const closeBranchModal = (): void => {
        branchDialogMode.value = null;
    };

    const saveBranch = async (): Promise<void> => {
        const payload: MasterBranchUpsertPayloadModel = {
            ...(typeof branchForm.id === 'number' ? { id: branchForm.id } : {}),
            branchCode: branchForm.branchCode,
            branchNumber: branchForm.branchNumber,
            branchName: branchForm.branchName,
            phoneNumber: branchForm.phoneNumber,
            address: branchForm.address,
            isActive: branchForm.isActive
        };

        isSavingBranch.value = true;
        setError(null);

        try {
            unwrapEitherOrThrow(await saveMasterBranchUsecase.execute(payload));
            await getMasterBranchData();
            closeBranchModal();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            throw error;
        } finally {
            isSavingBranch.value = false;
        }
    };

    const deleteBranch = async (branchId: number): Promise<void> => {
        isDeletingBranchIds.value = [...isDeletingBranchIds.value, branchId];
        setError(null);

        try {
            unwrapEitherOrThrow(await deleteMasterBranchUsecase.execute(branchId));
            await getMasterBranchData();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            throw error;
        } finally {
            isDeletingBranchIds.value = isDeletingBranchIds.value.filter((item) => item !== branchId);
        }
    };

    const openCreateLocationModal = (): void => {
        assignLocationForm();
        locationDialogMode.value = 'create';
        setError(null);
    };

    const openEditLocationModal = (locationId: number): void => {
        const location = getLocationById(locationId);
        if (!location) {
            return;
        }

        assignLocationForm(location);
        locationDialogMode.value = 'edit';
        setError(null);
    };

    const closeLocationModal = (): void => {
        locationDialogMode.value = null;
    };

    const saveLocation = async (): Promise<void> => {
        const payload: MasterLocationUpsertPayloadModel = {
            ...(typeof locationForm.id === 'number' ? { id: locationForm.id } : {}),
            branchId: Number(locationForm.branchId),
            locationCode: locationForm.locationCode,
            locationName: locationForm.locationName,
            locationType: locationForm.locationType,
            isActive: locationForm.isActive
        };

        isSavingLocation.value = true;
        setError(null);

        try {
            unwrapEitherOrThrow(await saveMasterLocationUsecase.execute(payload));
            await getMasterBranchData();
            closeLocationModal();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            throw error;
        } finally {
            isSavingLocation.value = false;
        }
    };

    const deleteLocation = async (locationId: number): Promise<void> => {
        isDeletingLocationIds.value = [...isDeletingLocationIds.value, locationId];
        setError(null);

        try {
            unwrapEitherOrThrow(await deleteMasterLocationUsecase.execute(locationId));
            await getMasterBranchData();
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            throw error;
        } finally {
            isDeletingLocationIds.value = isDeletingLocationIds.value.filter((item) => item !== locationId);
        }
    };

    const isDeletingBranch = (branchId: number): boolean => isDeletingBranchIds.value.includes(branchId);
    const isDeletingLocation = (locationId: number): boolean => isDeletingLocationIds.value.includes(locationId);

    const closeAllDialogs = (): void => {
        closeBranchModal();
        closeLocationModal();
    };

    watch(
        branchRows,
        (rows) => {
            branchTableService.setItems(rows);
        },
        { immediate: true }
    );

    watch(
        locationRows,
        (rows) => {
            locationTableService.setItems(rows);
        },
        { immediate: true }
    );

    return {
        ...state,
        branchForm,
        locationForm,
        branchDialogMode,
        locationDialogMode,
        branchDialogTitle,
        locationDialogTitle,
        isBranchDialogOpen,
        isLocationDialogOpen,
        isSavingBranch,
        isSavingLocation,
        totalBranchCount,
        activeBranchCount,
        inactiveBranchCount,
        totalLocationCount,
        activeLocationCount,
        linkedBranchCount,
        branchOptions,
        branchRowCount,
        locationRowCount,
        branchSearchKeyword,
        locationSearchKeyword,
        branchTableVm: branchTableService.vm as DataTableClientSideVM<MasterBranchTableRow>,
        locationTableVm: locationTableService.vm as DataTableClientSideVM<MasterLocationTableRow>,
        getMasterBranchData,
        openCreateBranchModal,
        openEditBranchModal,
        closeBranchModal,
        saveBranch,
        deleteBranch,
        openCreateLocationModal,
        openEditLocationModal,
        closeLocationModal,
        saveLocation,
        deleteLocation,
        isDeletingBranch,
        isDeletingLocation,
        closeAllDialogs,
        setError,
        formatValue
    };
});
