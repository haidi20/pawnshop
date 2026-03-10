import { ref, type Ref } from 'vue';

import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';

export interface IAuthAccessState {
    data: Ref<AuthAccessDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const authAccessState = (): IAuthAccessState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
