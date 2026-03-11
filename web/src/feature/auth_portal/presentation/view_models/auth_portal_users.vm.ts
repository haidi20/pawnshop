import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { unwrapEitherOrThrow } from '@core/util/either';
import {
    getAuthPortalCompanyUsersUsecase,
    updateAuthPortalUserBranchUsecase
} from '@feature/auth_portal/presentation/di/auth_portal.di';
import type {
    AuthPortalCompanyUsersDataModel,
    AuthPortalUpdateUserBranchPayloadModel
} from '@feature/auth_portal/domain/models';

export const authPortalUsersViewModel = defineStore('authPortalUsersStore', () => {
    const data = ref<AuthPortalCompanyUsersDataModel | null>(null);
    const isLoading = ref(false);
    const savingUserIds = ref<number[]>([]);
    const error = ref<string | null>(null);

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

    const isSavingUser = (userId: number): boolean => savingUserIds.value.includes(userId);

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

    const updateUserBranchAssignment = async (
        payload: AuthPortalUpdateUserBranchPayloadModel
    ): Promise<void> => {
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

    return {
        data,
        isLoading,
        error,
        branchOptions,
        userItems,
        totalUserCount,
        employeeCount,
        assignedEmployeeCount,
        loadData,
        updateUserBranchAssignment,
        isSavingUser,
        setError
    };
});
