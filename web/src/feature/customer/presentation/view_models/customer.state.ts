import { ref, type Ref } from 'vue';

import type { CustomerDataModel } from '@feature/customer/domain/models';

export interface ICustomerState {
    data: Ref<CustomerDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
}

export const customerState = (): ICustomerState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null)
});
