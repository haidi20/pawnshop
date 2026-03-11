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

export interface AuthPortalUsersTableRow {
    id: number;
    source: AuthPortalCompanyUserItemModel;
    roleLabel: string;
    fullName: string;
    usernameLabel: string;
    emailLabel: string;
    phoneNumberLabel: string;
    statusLabel: string;
    branchAccessLabel: string;
}

const authPortalUsersTableFields = [
    { key: 'roleLabel', label: 'Role', thClass: 'system-users-page__col-role' },
    { key: 'fullName', label: 'Nama User', thClass: 'system-users-page__col-name' },
    { key: 'usernameLabel', label: 'Username' },
    { key: 'emailLabel', label: 'Email' },
    { key: 'phoneNumberLabel', label: 'No. HP' },
    { key: 'statusLabel', label: 'Status', thClass: 'system-users-page__col-status' },
    { key: 'branchAccessLabel', label: 'Cabang Akses', thClass: 'system-users-page__col-branch' },
    { key: 'id', label: 'Aksi', thClass: 'system-users-page__col-action' }
] as const;

export const authPortalUsersViewModel = defineStore('authPortalUsersStore', () => {
    const data = ref<AuthPortalCompanyUsersDataModel | null>(null);
    const isLoading = ref(false);
    const savingUserIds = ref<number[]>([]);
    const error = ref<string | null>(null);
    const branchDrafts = reactive<Record<number, string>>({});
    const tableService = new DataTableClientSideService<AuthPortalUsersTableRow>([...authPortalUsersTableFields], []);

    const branchOptions = computed(() => data.value?.branches ?? []);
    const userItems = computed(() => data.value?.users ?? []);
    const totalUserCount = computed(() => userItems.value.length);
    const employeeCount = computed(() => userItems.value.filter((item) => item.role !== 'owner').length);
    const assignedEmployeeCount = computed(
        () => userItems.value.filter((item) => item.role !== 'owner' && item.assignedBranchId !== null).length
    );

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

    const mapUserToTableRow = (user: AuthPortalCompanyUserItemModel): AuthPortalUsersTableRow => ({
        id: user.id,
        source: user,
        roleLabel: getRoleLabel(user.role),
        fullName: user.fullName,
        usernameLabel: `@${user.username}`,
        emailLabel: formatValue(user.email),
        phoneNumberLabel: formatValue(user.phoneNumber),
        statusLabel: user.isActive ? 'Aktif' : 'Nonaktif',
        branchAccessLabel: getBranchAccessLabel(user)
    });

    const isSavingUser = (userId: number): boolean => savingUserIds.value.includes(userId);
    const canSaveUser = (userId: number): boolean => {
        const user = userItems.value.find((item) => item.id === userId);
        if (!user || user.role === 'owner') {
            return false;
        }

        const nextBranchId = branchDrafts[userId] || '';
        const currentBranchId = user.assignedBranchId !== null ? String(user.assignedBranchId) : '';
        return nextBranchId !== currentBranchId;
    };

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
            branchId: branchDrafts[userId] ? Number(branchDrafts[userId]) : null
        });
    };

    watch(
        userItems,
        (users) => {
            syncBranchDrafts(users);
            tableService.setItems(users.map(mapUserToTableRow));
        },
        { immediate: true, deep: true }
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
        dataTableVm: tableService.vm as DataTableClientSideVM<AuthPortalUsersTableRow>,
        loadData,
        updateUserBranchAssignment,
        saveBranchAssignment,
        isSavingUser,
        canSaveUser,
        getRoleLabel,
        formatValue,
        setError
    };
});
