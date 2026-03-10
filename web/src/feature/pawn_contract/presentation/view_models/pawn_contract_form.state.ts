import { reactive, ref, type Ref } from 'vue';

import {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import {
    type PawnContractFormReferenceModel,
    type PawnContractFormValueModel,
    type SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';
import { DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE } from '@feature/pawn_contract/presentation/view_models/pawn_contract_form.vm.utils';

export interface IPawnContractFormState {
    mode: Ref<PawnContractFormModeEnum>;
    currentContractId: Ref<number | null>;
    referenceData: Ref<PawnContractFormReferenceModel | null>;
    form: PawnContractFormValueModel;
    activeStep: Ref<1 | 2>;
    lastAutofilledCustomerId: Ref<number | null>;
    isLoading: Ref<boolean>;
    isSubmitting: Ref<boolean>;
    error: Ref<string | null>;
    submitError: Ref<string | null>;
    lastSavedResult: Ref<SavePawnContractResultModel | null>;
}

export const createPawnContractCustomerLookupKey = (): string =>
    `rahin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createInitialPawnContractFormValue = (): PawnContractFormValueModel => ({
    contractNumber: '',
    branchId: 0,
    contractDate: '',
    termDays: PawnContractTermDaysEnum.Seven,
    itemName: '',
    itemKind: PawnContractItemKindEnum.Electronic,
    itemDetailType: 'smartphone',
    itemDetailFirst: '',
    itemDetailSecond: '',
    itemDetailThird: '',
    accessorySummary: '',
    issueSummary: '',
    appraisedValue: 0,
    disbursedValue: 0,
    paymentOptionDays: PawnContractPaymentOptionDaysEnum.Daily,
    prepaidStoragePeriods: 0,
    customerLookupKey: createPawnContractCustomerLookupKey(),
    customerFullName: '',
    customerGender: PawnContractCustomerGenderEnum.Male,
    customerAddress: '',
    customerCity: '',
    customerPhone: '',
    customerIdentityType: PawnContractIdentityTypeEnum.Ktp,
    customerIdentityNumber: '',
    customerBirthDate: DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE
});

export const createPawnContractFormState = (): IPawnContractFormState => ({
    mode: ref(PawnContractFormModeEnum.Create),
    currentContractId: ref(null),
    referenceData: ref(null),
    form: reactive(createInitialPawnContractFormValue()),
    activeStep: ref(1),
    lastAutofilledCustomerId: ref(null),
    isLoading: ref(false),
    isSubmitting: ref(false),
    error: ref(null),
    submitError: ref(null),
    lastSavedResult: ref(null)
});

export const pawnContractFormState = createPawnContractFormState;
