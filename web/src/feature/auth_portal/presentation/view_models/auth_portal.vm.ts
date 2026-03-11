import { defineStore } from 'pinia';
import { unwrapEitherOrThrow } from '@core/util/either';
import {
    getCurrentAuthPortalSessionUsecase,
    loginAuthPortalUsecase,
    logoutAuthPortalUsecase,
    registerAuthPortalUsecase
} from '@feature/auth_portal/presentation/di/auth_portal.di';
import { authPortalState } from '@feature/auth_portal/presentation/view_models/auth_portal.state';
import type {
    AuthPortalLoginPayloadModel,
    AuthPortalRegisterPayloadModel,
    AuthPortalSessionSnapshotModel
} from '@feature/auth_portal/domain/models';

export const authPortalViewModel = defineStore('authPortalStore', () => {
    const state = authPortalState();

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const hydrateSession = async (): Promise<AuthPortalSessionSnapshotModel | null> => {
        state.isLoadingSession.value = true;
        setError(null);

        try {
            const session = unwrapEitherOrThrow(await getCurrentAuthPortalSessionUsecase.execute());
            state.currentSession.value = session;
            return session;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            state.currentSession.value = null;
            setError(message);
            return null;
        } finally {
            state.isLoadingSession.value = false;
        }
    };

    const login = async (payload: AuthPortalLoginPayloadModel): Promise<AuthPortalSessionSnapshotModel> => {
        state.isSubmitting.value = true;
        setError(null);

        try {
            const session = unwrapEitherOrThrow(await loginAuthPortalUsecase.execute(payload));
            state.currentSession.value = session;
            return session;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setError(message);
            throw error;
        } finally {
            state.isSubmitting.value = false;
        }
    };

    const register = async (payload: AuthPortalRegisterPayloadModel): Promise<AuthPortalSessionSnapshotModel> => {
        state.isSubmitting.value = true;
        setError(null);

        try {
            const session = unwrapEitherOrThrow(await registerAuthPortalUsecase.execute(payload));
            state.currentSession.value = session;
            return session;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setError(message);
            throw error;
        } finally {
            state.isSubmitting.value = false;
        }
    };

    const logout = async (): Promise<void> => {
        state.isSubmitting.value = true;
        setError(null);

        try {
            unwrapEitherOrThrow(await logoutAuthPortalUsecase.execute());
            state.currentSession.value = null;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setError(message);
            throw error;
        } finally {
            state.isSubmitting.value = false;
        }
    };

    return {
        ...state,
        hydrateSession,
        login,
        logout,
        register,
        setError
    };
});
