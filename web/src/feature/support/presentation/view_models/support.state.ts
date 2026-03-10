import { ref, type Ref } from 'vue';

import type { SupportDataModel } from '@feature/support/domain/models';

export interface ISupportState {
    data: Ref<SupportDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const supportState = (): ISupportState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
