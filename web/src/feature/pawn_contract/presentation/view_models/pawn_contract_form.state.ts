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
    type PawnContractItemPresetModel,
    type SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';
import type {
    PawnContractFormFieldErrorMap,
    PawnContractFormTouchedFieldMap,
    PawnContractStepOneAutoInsertSnapshotModel,
    PawnContractStepTwoAutoInsertSnapshotModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';
import { DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE } from '@feature/pawn_contract/presentation/view_models/pawn_contract_form.vm.utils';

export interface IPawnContractFormState {
    mode: Ref<PawnContractFormModeEnum>;
    currentContractId: Ref<number | null>;
    referenceData: Ref<PawnContractFormReferenceModel | null>;
    form: PawnContractFormValueModel;
    fieldErrors: PawnContractFormFieldErrorMap;
    touchedFields: PawnContractFormTouchedFieldMap;
    isStepOneAutoInsertEnabled: Ref<boolean>;
    stepOneAutoInsertSnapshot: Ref<PawnContractStepOneAutoInsertSnapshotModel | null>;
    isStepTwoAutoInsertEnabled: Ref<boolean>;
    stepTwoAutoInsertSnapshot: Ref<PawnContractStepTwoAutoInsertSnapshotModel | null>;
    isValidationModalOpen: Ref<boolean>;
    validationModalTitle: Ref<string>;
    validationErrorMessages: Ref<string[]>;
    isStepConfirmationModalOpen: Ref<boolean>;
    isSubmitConfirmationModalOpen: Ref<boolean>;
    activeStep: Ref<1 | 2>;
    lastAutofilledCustomerId: Ref<number | null>;
    isLoading: Ref<boolean>;
    isSubmitting: Ref<boolean>;
    error: Ref<string | null>;
    submitError: Ref<string | null>;
    lastSavedResult: Ref<SavePawnContractResultModel | null>;
}

export type GuideItemTypeSeed = {
    kind: PawnContractItemKindEnum;
    value: string;
    label: string;
    categoryCode: string;
    categoryName: string;
    typeCode: string;
    typeName: string;
    marginRate: number;
    deductionRate: number;
};

export const guideItemTypeSeeds: GuideItemTypeSeed[] = [
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'smartphone',
        label: 'Smartphone',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-SMARTPHONE',
        typeName: 'Smartphone',
        marginRate: 12,
        deductionRate: 2
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'laptop',
        label: 'Laptop',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-LAPTOP',
        typeName: 'Laptop',
        marginRate: 11,
        deductionRate: 2
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'kamera',
        label: 'Kamera',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-CAMERA',
        typeName: 'Kamera',
        marginRate: 10,
        deductionRate: 2
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'tv',
        label: 'Televisi',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-TV',
        typeName: 'Televisi',
        marginRate: 9,
        deductionRate: 1
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'lain_lain',
        label: 'Elektronik lain',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-OTHER',
        typeName: 'Elektronik Lain',
        marginRate: 8,
        deductionRate: 1
    },
    {
        kind: PawnContractItemKindEnum.Vehicle,
        value: 'motor',
        label: 'Motor',
        categoryCode: 'VEH',
        categoryName: 'Kendaraan',
        typeCode: 'VEH-MOTOR',
        typeName: 'Motor',
        marginRate: 14,
        deductionRate: 4
    },
    {
        kind: PawnContractItemKindEnum.Vehicle,
        value: 'mobil',
        label: 'Mobil',
        categoryCode: 'VEH',
        categoryName: 'Kendaraan',
        typeCode: 'VEH-CAR',
        typeName: 'Mobil',
        marginRate: 13,
        deductionRate: 3
    }
];

export const itemPresetMeta: Record<
    PawnContractItemKindEnum,
    Pick<PawnContractItemPresetModel, 'label' | 'description' | 'administrationFeeAmount' | 'detailLabels'>
> = {
    [PawnContractItemKindEnum.Electronic]: {
        label: 'Elektronik',
        description: 'Gunakan untuk smartphone, laptop, kamera, TV, dan barang elektronik sejenis.',
        administrationFeeAmount: 10_000,
        detailLabels: {
            first: 'Tipe / seri',
            second: 'Merek',
            third: 'IMEI / nomor serial'
        }
    },
    [PawnContractItemKindEnum.Vehicle]: {
        label: 'Kendaraan',
        description: 'Gunakan untuk motor atau mobil dengan identitas kendaraan yang jelas.',
        administrationFeeAmount: 50_000,
        detailLabels: {
            first: 'Nomor polisi',
            second: 'Warna kendaraan',
            third: 'Nomor rangka'
        }
    }
};

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

export const createInitialPawnContractFormFieldErrors = (): PawnContractFormFieldErrorMap => ({
    contractNumber: null,
    branchId: null,
    contractDate: null,
    termDays: null,
    itemName: null,
    itemKind: null,
    itemDetailType: null,
    itemDetailFirst: null,
    itemDetailSecond: null,
    itemDetailThird: null,
    accessorySummary: null,
    issueSummary: null,
    appraisedValue: null,
    disbursedValue: null,
    paymentOptionDays: null,
    prepaidStoragePeriods: null,
    customerLookupKey: null,
    customerFullName: null,
    customerGender: null,
    customerAddress: null,
    customerCity: null,
    customerPhone: null,
    customerIdentityType: null,
    customerIdentityNumber: null,
    customerBirthDate: null
});

export const createInitialPawnContractTouchedFields = (): PawnContractFormTouchedFieldMap => ({
    contractNumber: false,
    branchId: false,
    contractDate: false,
    termDays: false,
    itemName: false,
    itemKind: false,
    itemDetailType: false,
    itemDetailFirst: false,
    itemDetailSecond: false,
    itemDetailThird: false,
    accessorySummary: false,
    issueSummary: false,
    appraisedValue: false,
    disbursedValue: false,
    paymentOptionDays: false,
    prepaidStoragePeriods: false,
    customerLookupKey: false,
    customerFullName: false,
    customerGender: false,
    customerAddress: false,
    customerCity: false,
    customerPhone: false,
    customerIdentityType: false,
    customerIdentityNumber: false,
    customerBirthDate: false
});

export const createPawnContractFormState = (): IPawnContractFormState => ({
    mode: ref(PawnContractFormModeEnum.Create),
    currentContractId: ref(null),
    referenceData: ref(null),
    form: reactive(createInitialPawnContractFormValue()),
    fieldErrors: reactive(createInitialPawnContractFormFieldErrors()),
    touchedFields: reactive(createInitialPawnContractTouchedFields()),
    isStepOneAutoInsertEnabled: ref(false),
    stepOneAutoInsertSnapshot: ref(null),
    isStepTwoAutoInsertEnabled: ref(false),
    stepTwoAutoInsertSnapshot: ref(null),
    isValidationModalOpen: ref(false),
    validationModalTitle: ref('Masih ada data yang perlu dilengkapi'),
    validationErrorMessages: ref([]),
    isStepConfirmationModalOpen: ref(false),
    isSubmitConfirmationModalOpen: ref(false),
    activeStep: ref(1),
    lastAutofilledCustomerId: ref(null),
    isLoading: ref(false),
    isSubmitting: ref(false),
    error: ref(null),
    submitError: ref(null),
    lastSavedResult: ref(null)
});

export const pawnContractFormState = createPawnContractFormState;
