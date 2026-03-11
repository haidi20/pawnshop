import { ref } from 'vue';
import type { AuthPortalSessionSnapshotModel } from '@feature/auth_portal/domain/models';
import { readAuthPortalStoredSession } from '@feature/auth_portal/util/auth_portal_session';

export const authPortalState = () => ({
    currentSession: ref<AuthPortalSessionSnapshotModel | null>(readAuthPortalStoredSession()),
    isLoadingSession: ref(false),
    isSubmitting: ref(false),
    error: ref<string | null>(null)
});
