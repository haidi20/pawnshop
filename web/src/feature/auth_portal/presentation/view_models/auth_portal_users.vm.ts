import { computed, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { DataTableClientSideService } from '@core/presentation/services/datatable_clientside.service';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import { unwrapEitherOrThrow } from '@core/util/either';
import {
    getAuthPortalCompanyUsersUsecase,
    updateAuthPortalUserBranchUsecase
} from '@feature/auth_portal/presentation/di/auth_portal.di';
import type {
    AuthPortalCompanyUserItemModel,
    AuthPortalCompanyUsersDataModel,
    AuthPortalUpdateUserBranchPayloadModel
} from '@feature/auth_portal/domain/models';

export type AuthPortalUserAssignmentTone = 'neutral' | 'info' | 'warning';

export interface AuthPortalUsersTableRow {
    id: number;
    source: AuthPortalCompanyUserItemModel;
    actionLabel: string;
    roleLabel: string;
    userSummary: string;
    usernameLabel: string;
    emailLabel: string;
    phoneNumberLabel: string;
    statusLabel: string;
    branchAccessLabel: string;
    assignmentStatusLabel: string;
    assignmentHelpText: string;
    currentBranchLabel: string;
    assignmentTone: AuthPortalUserAssignmentTone;
    needsAttention: boolean;
    searchText: string;
}

const authPortalUsersTableFields = [
    { key: 'actionLabel', label: 'Aksi', thClass: 'system-users-page__col-action' },
    { key: 'roleLabel', label: 'Role', thClass: 'system-users-page__col-role' },
    { key: 'userSummary', label: 'User', thClass: 'system-users-page__col-user' },
    { key: 'statusLabel', label: 'Status', thClass: 'system-users-page__col-status' },
    { key: 'branchAccessLabel', label: 'Cabang Akses', thClass: 'system-users-page__col-branch' }
] as const;

interface AuthPortalUserAssignmentState {
    statusLabel: string;
    helpText: string;
    currentBranchLabel: string;
    tone: AuthPortalUserAssignmentTone;
    needsAttention: boolean;
}

export interface AuthPortalBranchModalState extends AuthPortalUserAssignmentState {
    draftBranchLabel: string;
    hasPendingChange: boolean;
}

export const authPortalUsersViewModel = defineStore('authPortalUsersStore', () => {
    const data = ref<AuthPortalCompanyUsersDataModel | null>(null);
    const isLoading = ref(false);
    const savingUserIds = ref<number[]>([]);
    const error = ref<string | null>(null);
    const actionModalUserId = ref<number | null>(null);
    const branchModalUserId = ref<number | null>(null);
    const branchDrafts = reactive<Record<number, string>>({});
    const tableService = new DataTableClientSideService<AuthPortalUsersTableRow>([...authPortalUsersTableFields], []);

    const branchOptions = computed(() => data.value?.branches ?? []);
    const userItems = computed(() => data.value?.users ?? []);
    const totalUserCount = computed(() => userItems.value.length);
    const employeeCount = computed(() => userItems.value.filter((item) => item.role !== 'owner').length);
    const assignedEmployeeCount = computed(
        () => userItems.value.filter((item) => item.role !== 'owner' && item.assignedBranchId !== null).length
    );
    const unassignedEmployeeCount = computed(
        () => userItems.value.filter((item) => item.role !== 'owner' && item.assignedBranchId === null).length
    );
    const pendingBranchChangeCount = computed(
        () => userItems.value.filter((item) => item.role !== 'owner' && canSaveUser(item.id)).length
    );
    const filteredUserCount = computed(() => tableService.vm.totalItems as number);
    const searchKeyword = computed(() => String(tableService.vm.search ?? '').trim());
    const activeActionModalUser = computed(() =>
        actionModalUserId.value !== null ? getUserById(actionModalUserId.value) ?? null : null
    );
    const activeBranchModalUser = computed(() =>
        branchModalUserId.value !== null ? getUserById(branchModalUserId.value) ?? null : null
    );
    const isActionModalOpen = computed(() => activeActionModalUser.value !== null);
    const isBranchModalOpen = computed(() => activeBranchModalUser.value !== null);

    const setError = (message: string | null): void => {
        error.value = message;
    };

    const formatValue = (value: string | null): string => {
        const normalizedValue = value?.trim();
        return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '-';
    };

    const getRoleLabel = (role: AuthPortalCompanyUserItemModel['role']): string => {
        switch (role) {
            case 'owner':
                return 'Owner';
            case 'admin':
                return 'Admin';
            default:
                return 'Staff';
        }
    };

    const getBranchAccessLabel = (user: AuthPortalCompanyUserItemModel): string =>
        user.role === 'owner'
            ? 'Semua cabang'
            : user.assignedBranchName ?? 'Belum diatur';

    const getUserById = (userId: number): AuthPortalCompanyUserItemModel | undefined =>
        userItems.value.find((item) => item.id === userId);

    const getDraftBranchId = (userId: number): number | null => {
        const draftValue = branchDrafts[userId]?.trim();
        if (!draftValue) {
            return null;
        }

        const normalizedValue = Number(draftValue);
        return Number.isFinite(normalizedValue) ? normalizedValue : null;
    };

    const getDraftBranchLabel = (userId: number): string => {
        const draftBranchId = getDraftBranchId(userId);

        if (draftBranchId === null) {
            return 'Belum diatur';
        }

        return branchOptions.value.find((item) => item.id === draftBranchId)?.branchName ?? 'Cabang tidak ditemukan';
    };

    const resetBranchDraft = (userId: number): void => {
        const user = getUserById(userId);
        if (!user || user.role === 'owner') {
            return;
        }

        branchDrafts[user.id] = user.assignedBranchId !== null ? String(user.assignedBranchId) : '';
    };

    const syncBranchDrafts = (users: AuthPortalCompanyUserItemModel[]): void => {
        Object.keys(branchDrafts).forEach((key) => {
            const userId = Number(key);
            if (!users.some((user) => user.id === userId)) {
                delete branchDrafts[userId];
            }
        });

        users.forEach((user) => {
            branchDrafts[user.id] = user.assignedBranchId !== null ? String(user.assignedBranchId) : '';
        });
    };

    const mapUserToTableRow = (user: AuthPortalCompanyUserItemModel): AuthPortalUsersTableRow => {
        const roleLabel = getRoleLabel(user.role);
        const emailLabel = formatValue(user.email);
        const phoneNumberLabel = formatValue(user.phoneNumber);
        const branchAccessLabel = getBranchAccessLabel(user);
        const assignmentState = getAssignmentState(user);

        return {
            id: user.id,
            source: user,
            actionLabel: user.role === 'owner' ? 'Semua cabang' : 'Aksi',
            roleLabel,
            userSummary: user.fullName,
            usernameLabel: `@${user.username}`,
            emailLabel,
            phoneNumberLabel,
            statusLabel: user.isActive ? 'Aktif' : 'Nonaktif',
            branchAccessLabel,
            assignmentStatusLabel: assignmentState.statusLabel,
            assignmentHelpText: assignmentState.helpText,
            currentBranchLabel: assignmentState.currentBranchLabel,
            assignmentTone: assignmentState.tone,
            needsAttention: assignmentState.needsAttention,
            searchText: [
                roleLabel,
                user.fullName,
                user.username,
                emailLabel,
                phoneNumberLabel,
                branchAccessLabel,
                assignmentState.currentBranchLabel,
                user.isActive ? 'Aktif' : 'Nonaktif'
            ].join(' ')
        };
    };

    const isSavingUser = (userId: number): boolean => savingUserIds.value.includes(userId);
    const canSaveUser = (userId: number): boolean => {
        const user = getUserById(userId);
        if (!user || user.role === 'owner') {
            return false;
        }

        const nextBranchId = branchDrafts[userId] || '';
        const currentBranchId = user.assignedBranchId !== null ? String(user.assignedBranchId) : '';
        return nextBranchId !== currentBranchId;
    };

    const getAssignmentState = (user: AuthPortalCompanyUserItemModel): AuthPortalUserAssignmentState => {
        if (user.role === 'owner') {
            return {
                statusLabel: 'Akses otomatis',
                helpText: 'Owner selalu melihat seluruh cabang aktif tanpa perlu assignment manual.',
                currentBranchLabel: 'Semua cabang',
                tone: 'info',
                needsAttention: false
            };
        }

        const currentBranchLabel = user.assignedBranchName ?? 'Belum diatur';
        if (user.assignedBranchId === null) {
            return {
                statusLabel: 'Cabang belum diatur',
                helpText: 'User ini belum punya akses cabang. Klik Ubah cabang untuk memilih cabang operasionalnya.',
                currentBranchLabel,
                tone: 'warning',
                needsAttention: true
            };
        }

        return {
            statusLabel: 'Cabang sinkron',
            helpText: 'Cabang tersimpan sudah aktif dan bisa diubah melalui menu aksi.',
            currentBranchLabel,
            tone: 'neutral',
            needsAttention: false
        };
    };

    const getBranchModalState = (user: AuthPortalCompanyUserItemModel): AuthPortalBranchModalState => {
        if (user.role === 'owner') {
            return {
                statusLabel: 'Akses otomatis',
                helpText: 'Owner selalu melihat seluruh cabang aktif tanpa perlu assignment manual.',
                currentBranchLabel: 'Semua cabang',
                draftBranchLabel: 'Semua cabang',
                tone: 'info',
                hasPendingChange: false,
                needsAttention: false
            };
        }

        const currentBranchLabel = user.assignedBranchName ?? 'Belum diatur';
        const draftBranchLabel = getDraftBranchLabel(user.id);
        const hasPendingChange = canSaveUser(user.id);

        if (hasPendingChange) {
            if (draftBranchLabel === 'Belum diatur') {
                return {
                    statusLabel: 'Cabang akan dihapus',
                    helpText: 'Simpan perubahan ini untuk menghapus akses cabang user.',
                    currentBranchLabel,
                    draftBranchLabel,
                    tone: 'warning',
                    hasPendingChange,
                    needsAttention: false
                };
            }

            return {
                statusLabel:
                    user.assignedBranchId === null ? 'Cabang baru siap disimpan' : 'Perubahan siap disimpan',
                helpText:
                    user.assignedBranchId === null
                        ? 'Simpan untuk memberi akses cabang pertama pada user ini.'
                        : 'Simpan untuk mengganti cabang operasional user ini.',
                currentBranchLabel,
                draftBranchLabel,
                tone: 'info',
                hasPendingChange,
                needsAttention: false
            };
        }

        if (user.assignedBranchId === null) {
            return {
                statusLabel: 'Cabang belum diatur',
                helpText: 'Pilih satu cabang agar user dapat melihat data operasional cabangnya.',
                currentBranchLabel,
                draftBranchLabel,
                tone: 'warning',
                hasPendingChange: false,
                needsAttention: true
            };
        }

        return {
            statusLabel: 'Cabang saat ini aktif',
            helpText: 'Pilih cabang lain bila Anda ingin memindahkan akses user ini.',
            currentBranchLabel,
            draftBranchLabel,
            tone: 'neutral',
            hasPendingChange: false,
            needsAttention: false
        };
    };

    const activeBranchModalState = computed(() =>
        activeBranchModalUser.value ? getBranchModalState(activeBranchModalUser.value) : null
    );

    const loadData = async (): Promise<void> => {
        isLoading.value = true;
        setError(null);

        try {
            data.value = unwrapEitherOrThrow(await getAuthPortalCompanyUsersUsecase.execute());
        } catch (currentError) {
            data.value = null;
            setError(currentError instanceof Error ? currentError.message : String(currentError));
        } finally {
            isLoading.value = false;
        }
    };

    const updateUserBranchAssignment = async (payload: AuthPortalUpdateUserBranchPayloadModel): Promise<void> => {
        savingUserIds.value = [...savingUserIds.value, payload.userId];
        setError(null);

        try {
            unwrapEitherOrThrow(await updateAuthPortalUserBranchUsecase.execute(payload));

            if (!data.value) {
                return;
            }

            const nextBranch = data.value.branches.find((item) => item.id === payload.branchId) ?? null;
            data.value = {
                ...data.value,
                users: data.value.users.map((item) =>
                    item.id === payload.userId
                        ? {
                            ...item,
                            assignedBranchId: payload.branchId,
                            assignedBranchName: nextBranch?.branchName ?? null
                        }
                        : item
                )
            };
        } catch (currentError) {
            setError(currentError instanceof Error ? currentError.message : String(currentError));
            throw currentError;
        } finally {
            savingUserIds.value = savingUserIds.value.filter((userId) => userId !== payload.userId);
        }
    };

    const saveBranchAssignment = async (userId: number): Promise<void> => {
        await updateUserBranchAssignment({
            userId,
            branchId: getDraftBranchId(userId)
        });
    };

    const openBranchModal = (userId: number): void => {
        const user = getUserById(userId);
        if (!user || user.role === 'owner') {
            return;
        }

        resetBranchDraft(userId);
        branchModalUserId.value = userId;
        setError(null);
    };

    const closeBranchModal = (): void => {
        branchModalUserId.value = null;
    };

    const cancelBranchModal = (): void => {
        if (branchModalUserId.value !== null) {
            resetBranchDraft(branchModalUserId.value);
        }

        closeBranchModal();
    };

    const saveBranchFromModal = async (): Promise<void> => {
        if (branchModalUserId.value === null) {
            return;
        }

        const userId = branchModalUserId.value;
        await saveBranchAssignment(userId);
        closeBranchModal();
    };

    const openActionModal = (userId: number): void => {
        const user = getUserById(userId);
        if (!user || user.role === 'owner') {
            return;
        }

        actionModalUserId.value = userId;
        setError(null);
    };

    const closeActionModal = (): void => {
        actionModalUserId.value = null;
    };

    const openBranchModalFromAction = (): void => {
        if (actionModalUserId.value === null) {
            return;
        }

        const userId = actionModalUserId.value;
        closeActionModal();
        openBranchModal(userId);
    };

    watch(
        userItems,
        (users) => {
            syncBranchDrafts(users);
        },
        { immediate: true, deep: true }
    );

    const tableRows = computed(() => userItems.value.map(mapUserToTableRow));

    watch(
        tableRows,
        (rows) => {
            tableService.setItems(rows);
        },
        { immediate: true }
    );

    return {
        data,
        isLoading,
        error,
        branchOptions,
        branchDrafts,
        userItems,
        totalUserCount,
        employeeCount,
        assignedEmployeeCount,
        unassignedEmployeeCount,
        pendingBranchChangeCount,
        filteredUserCount,
        searchKeyword,
        actionModalUserId,
        activeActionModalUser,
        isActionModalOpen,
        branchModalUserId,
        activeBranchModalUser,
        activeBranchModalState,
        isBranchModalOpen,
        dataTableVm: tableService.vm as DataTableClientSideVM<AuthPortalUsersTableRow>,
        loadData,
        updateUserBranchAssignment,
        saveBranchAssignment,
        openActionModal,
        closeActionModal,
        openBranchModal,
        openBranchModalFromAction,
        closeBranchModal,
        cancelBranchModal,
        saveBranchFromModal,
        isSavingUser,
        canSaveUser,
        getAssignmentState,
        getBranchModalState,
        getDraftBranchLabel,
        resetBranchDraft,
        getRoleLabel,
        formatValue,
        setError
    };
});
