import type { EnumOptionModel } from '@core/domain/models/enum-option.model';
import {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import { normalizePawnContractCustomerName } from '@core/util/pawn-contract-form';
import type {
    PawnContractCustomerLookupModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    PawnContractItemPresetModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';
import type {
    PawnContractConfirmationRowModel,
    PawnContractConfirmationSectionModel,
    PawnContractFinalConfirmationModel,
    PawnContractStepConfirmationModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_confirmation.model';
import type {
    PawnContractCustomerSuggestionOptionModel,
    PawnContractFormFieldName,
    PawnContractFormTouchedFieldMap,
    PawnContractItemDetailPlaceholderModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';
import type {
    PawnContractStepOneAutoInsertFieldName,
    PawnContractStepOneAutoInsertSnapshotModel,
    PawnContractStepTwoAutoInsertFieldName,
    PawnContractStepTwoAutoInsertSnapshotModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';
import { validatePawnContractForm } from '@feature/pawn_contract/presentation/validations/pawn_contract_form.validation';

export const DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE = '2000-01-01';

export interface PawnContractRouteContextModel {
    mode: PawnContractFormModeEnum;
    contractId: number | null;
}

export interface PawnContractSummaryPresentationParams {
    form: PawnContractFormValueModel;
    selectedBranchName: string | null;
    selectedBranchAvailableBalance: number | null;
    maturityDate: string;
    currentPresetLabel: string | null;
    currentPresetDetailLabels: PawnContractItemPresetModel['detailLabels'] | null;
    selectedDetailOptionLabel: string | null;
    selectedDetailMarginRate: number | null;
    selectedDetailDeductionRate: number | null;
    selectedPaymentOptionLabel: string | null;
    selectedPaymentOptionHelper: string | null;
    storageFeeAmount: number;
    prepaidStorageAmount: number;
    prepaidStoragePeriodLabel: string;
    administrationFeeAmount: number;
    customerReceivedAmount: number;
    amountInWords: string;
    projectedRemainingBalance: number;
    formatCurrency: (value: number) => string;
    formatDate: (value: string) => string;
}

export interface PawnContractFinalConfirmationPresentationParams extends PawnContractSummaryPresentationParams {
    customerLookupMessage: string;
    customerGenderLabel: string;
    projectedRemainingBalance: number;
    hasEnoughBalance: boolean;
}

export const MAX_PAWN_CONTRACT_CUSTOMER_SUGGESTION_COUNT = 5;

export enum PawnContractCustomerLookupFieldEnum {
    FullName = 'fullName',
    PhoneNumber = 'phoneNumber',
    IdentityNumber = 'identityNumber'
}

export const escapeHtml = (value: string): string =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

export const createErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const createPawnContractRouteContext = (routeContractId: unknown): PawnContractRouteContextModel => {
    const rawValue = Array.isArray(routeContractId) ? routeContractId[0] : routeContractId;
    const contractId = typeof rawValue === 'string' ? Number(rawValue) : NaN;

    if (Number.isInteger(contractId) && contractId > 0) {
        return {
            mode: PawnContractFormModeEnum.Edit,
            contractId
        };
    }

    return {
        mode: PawnContractFormModeEnum.Create,
        contractId: null
    };
};

export const createDefaultPawnContractFormValue = (params: {
    referenceData: PawnContractFormReferenceModel;
    createCustomerLookupKey: () => string;
}): PawnContractFormValueModel => ({
    contractNumber: params.referenceData.nextContractNumber,
    branchId: params.referenceData.defaultBranchId ?? 0,
    contractDate: params.referenceData.defaultContractDate,
    termDays: params.referenceData.termOptions[0]?.value ?? PawnContractTermDaysEnum.Seven,
    itemName: '',
    itemKind: PawnContractItemKindEnum.Electronic,
    itemDetailType: params.referenceData.itemPresets[PawnContractItemKindEnum.Electronic].defaultDetailValue,
    itemDetailFirst: '',
    itemDetailSecond: '',
    itemDetailThird: '',
    accessorySummary: '',
    issueSummary: '',
    appraisedValue: 0,
    disbursedValue: 0,
    paymentOptionDays: params.referenceData.paymentOptions[0]?.value ?? PawnContractPaymentOptionDaysEnum.Daily,
    prepaidStoragePeriods: 0,
    customerLookupKey: params.createCustomerLookupKey(),
    customerFullName: '',
    customerGender: PawnContractCustomerGenderEnum.Male,
    customerAddress: '',
    customerCity: '',
    customerPhone: '',
    customerIdentityType: PawnContractIdentityTypeEnum.Ktp,
    customerIdentityNumber: '',
    customerBirthDate: DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE
});

export const createCustomerLookupFormPatch = (
    customer: PawnContractCustomerLookupModel
): Pick<
    PawnContractFormValueModel,
    | 'customerFullName'
    | 'customerGender'
    | 'customerAddress'
    | 'customerCity'
    | 'customerPhone'
    | 'customerIdentityType'
    | 'customerIdentityNumber'
    | 'customerBirthDate'
> => ({
    customerFullName: customer.fullName,
    customerGender: customer.gender,
    customerAddress: customer.address,
    customerCity: customer.city,
    customerPhone: customer.phoneNumber,
    customerIdentityType: customer.identityType ?? PawnContractIdentityTypeEnum.Ktp,
    customerIdentityNumber: customer.identityNumber ?? '',
    customerBirthDate: customer.birthDate ?? DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE
});

const normalizePawnContractCustomerPhone = (value: string): string => value.replace(/\D+/g, '');

const normalizePawnContractCustomerIdentityNumber = (value: string): string =>
    value.replace(/[^0-9a-z]+/gi, '').trim().toLowerCase();

const normalizePawnContractCustomerLookupValue = (
    field: PawnContractCustomerLookupFieldEnum,
    value: string | null
): string => {
    const safeValue = value ?? '';

    switch (field) {
        case PawnContractCustomerLookupFieldEnum.FullName:
            return normalizePawnContractCustomerName(safeValue);
        case PawnContractCustomerLookupFieldEnum.PhoneNumber:
            return normalizePawnContractCustomerPhone(safeValue);
        case PawnContractCustomerLookupFieldEnum.IdentityNumber:
            return normalizePawnContractCustomerIdentityNumber(safeValue);
    }
};

const getPawnContractCustomerLookupFieldValue = (
    customer: PawnContractCustomerLookupModel,
    field: PawnContractCustomerLookupFieldEnum
): string | null => {
    switch (field) {
        case PawnContractCustomerLookupFieldEnum.FullName:
            return customer.fullName;
        case PawnContractCustomerLookupFieldEnum.PhoneNumber:
            return customer.phoneNumber;
        case PawnContractCustomerLookupFieldEnum.IdentityNumber:
            return customer.identityNumber;
    }
};

const buildPawnContractCustomerSuggestionLabel = (
    customer: PawnContractCustomerLookupModel,
    field: PawnContractCustomerLookupFieldEnum
): string => {
    switch (field) {
        case PawnContractCustomerLookupFieldEnum.FullName:
            return `${customer.customerCode} | ${customer.phoneNumber || '-'} | ${customer.identityNumber ?? '-'}`;
        case PawnContractCustomerLookupFieldEnum.PhoneNumber:
            return `${customer.fullName} | ${customer.identityNumber ?? '-'} | ${customer.customerCode}`;
        case PawnContractCustomerLookupFieldEnum.IdentityNumber:
            return `${customer.fullName} | ${customer.phoneNumber || '-'} | ${customer.customerCode}`;
    }
};

const comparePawnContractCustomerSuggestions = (
    left: PawnContractCustomerLookupModel,
    right: PawnContractCustomerLookupModel,
    field: PawnContractCustomerLookupFieldEnum,
    normalizedKeyword: string
): number => {
    const leftValue = normalizePawnContractCustomerLookupValue(field, getPawnContractCustomerLookupFieldValue(left, field));
    const rightValue = normalizePawnContractCustomerLookupValue(field, getPawnContractCustomerLookupFieldValue(right, field));
    const leftScore = leftValue === normalizedKeyword ? 0 : leftValue.startsWith(normalizedKeyword) ? 1 : 2;
    const rightScore = rightValue === normalizedKeyword ? 0 : rightValue.startsWith(normalizedKeyword) ? 1 : 2;

    if (leftScore !== rightScore) {
        return leftScore - rightScore;
    }

    return left.fullName.localeCompare(right.fullName, 'id-ID');
};

export const findMatchedPawnContractCustomer = (params: {
    customers: PawnContractCustomerLookupModel[];
    keyword: string;
    field: PawnContractCustomerLookupFieldEnum;
}): PawnContractCustomerLookupModel | null => {
    const normalizedKeyword = normalizePawnContractCustomerLookupValue(params.field, params.keyword);
    if (!normalizedKeyword) {
        return null;
    }

    return (
        params.customers.find(
            (customer) =>
                normalizePawnContractCustomerLookupValue(
                    params.field,
                    getPawnContractCustomerLookupFieldValue(customer, params.field)
                ) === normalizedKeyword
        ) ?? null
    );
};

export const buildPawnContractCustomerSuggestions = (params: {
    customers: PawnContractCustomerLookupModel[];
    keyword: string;
    field: PawnContractCustomerLookupFieldEnum;
    limit?: number;
}): PawnContractCustomerSuggestionOptionModel[] => {
    const normalizedKeyword = normalizePawnContractCustomerLookupValue(params.field, params.keyword);
    if (!normalizedKeyword) {
        return [];
    }

    return params.customers
        .filter((customer) =>
            normalizePawnContractCustomerLookupValue(
                params.field,
                getPawnContractCustomerLookupFieldValue(customer, params.field)
            ).includes(normalizedKeyword)
        )
        .sort((left, right) => comparePawnContractCustomerSuggestions(left, right, params.field, normalizedKeyword))
        .slice(0, params.limit ?? MAX_PAWN_CONTRACT_CUSTOMER_SUGGESTION_COUNT)
        .map((customer) => ({
            key: `${params.field}-${customer.id}`,
            value: getPawnContractCustomerLookupFieldValue(customer, params.field) ?? '',
            label: buildPawnContractCustomerSuggestionLabel(customer, params.field)
        }));
};

export const createPawnContractItemDetailPlaceholders = (params: {
    itemKind: PawnContractItemKindEnum;
    itemDetailType: string;
    detailLabels: PawnContractItemPresetModel['detailLabels'] | null;
}): PawnContractItemDetailPlaceholderModel => {
    const matchedPlaceholder =
        pawnContractItemDetailPlaceholderMap[params.itemKind][params.itemDetailType] ??
        Object.values(pawnContractItemDetailPlaceholderMap[params.itemKind])[0] ??
        null;

    if (matchedPlaceholder) {
        return matchedPlaceholder;
    }

    return {
        first: `Contoh: ${params.detailLabels?.first ?? 'Isi detail pertama'}`,
        second: `Contoh: ${params.detailLabels?.second ?? 'Isi detail kedua'}`,
        third: `Contoh: ${params.detailLabels?.third ?? 'Isi detail ketiga'}`
    };
};

const createConfirmationRow = (
    key: string,
    label: string,
    value: string,
    helper?: string,
    valueClassName?: string
): PawnContractConfirmationRowModel => ({
    key,
    label,
    value: value.trim() || '-',
    helper,
    valueClassName
});

const createConfirmationSection = (
    id: string,
    kicker: string,
    title: string,
    description: string,
    iconClass: string,
    rows: PawnContractConfirmationRowModel[]
): PawnContractConfirmationSectionModel => ({
    id,
    kicker,
    title,
    description,
    iconClass,
    rows
});

const formatPawnContractPaymentOptionLabel = (label: string | null, days: number): string =>
    label ?? `Per ${days} hari`;

const pawnContractItemDetailPlaceholderMap: Record<
    PawnContractItemKindEnum,
    Record<string, PawnContractItemDetailPlaceholderModel>
> = {
    [PawnContractItemKindEnum.Electronic]: {
        smartphone: {
            first: 'Contoh: iPhone 13 Pro 128GB',
            second: 'Contoh: Apple',
            third: 'Contoh: 356789012345678'
        },
        laptop: {
            first: 'Contoh: ThinkPad X1 Carbon Gen 11',
            second: 'Contoh: Lenovo',
            third: 'Contoh: PF-3A1B9C'
        },
        kamera: {
            first: 'Contoh: EOS R50 Kit 18-45mm',
            second: 'Contoh: Canon',
            third: 'Contoh: 1420034589'
        },
        tv: {
            first: 'Contoh: UHD 50AU7000 50 inci',
            second: 'Contoh: Samsung',
            third: 'Contoh: SN-TV-2026-001'
        },
        lain_lain: {
            first: 'Contoh: Speaker aktif 12 inci',
            second: 'Contoh: Polytron',
            third: 'Contoh: SN-ELEC-99881'
        }
    },
    [PawnContractItemKindEnum.Vehicle]: {
        motor: {
            first: 'Contoh: DD 1234 XY',
            second: 'Contoh: Hitam doff',
            third: 'Contoh: MH1JB1234NK567890'
        },
        mobil: {
            first: 'Contoh: DD 1881 AB',
            second: 'Contoh: Putih mutiara',
            third: 'Contoh: MHK2GB123LJ456789'
        }
    }
};

export const pawnContractStepOneFieldNames: PawnContractFormFieldName[] = [
    'branchId',
    'contractDate',
    'itemName',
    'itemDetailType',
    'itemDetailFirst',
    'itemDetailSecond',
    'itemDetailThird',
    'accessorySummary',
    'issueSummary',
    'appraisedValue',
    'disbursedValue'
];

export const pawnContractStepOneAutoInsertFieldNames: PawnContractStepOneAutoInsertFieldName[] = [
    'branchId',
    'contractDate',
    'termDays',
    'itemName',
    'itemKind',
    'itemDetailType',
    'itemDetailFirst',
    'itemDetailSecond',
    'itemDetailThird',
    'accessorySummary',
    'issueSummary',
    'appraisedValue',
    'disbursedValue',
    'paymentOptionDays',
    'prepaidStoragePeriods'
];

export const pawnContractStepTwoFieldNames: PawnContractFormFieldName[] = [
    'customerFullName',
    'customerAddress',
    'customerCity',
    'customerPhone',
    'customerIdentityNumber'
];

export const pawnContractStepTwoAutoInsertFieldNames: PawnContractStepTwoAutoInsertFieldName[] = [
    'customerFullName',
    'customerGender',
    'customerAddress',
    'customerCity',
    'customerPhone',
    'customerIdentityType',
    'customerIdentityNumber',
    'customerBirthDate'
];

const removeExamplePrefix = (value: string): string => value.replace(/^Contoh:\s*/i, '').trim();

const createAutoInsertValueSnapshot = <TFieldName extends PawnContractFormFieldName>(
    fields: readonly TFieldName[],
    form: PawnContractFormValueModel
): Pick<PawnContractFormValueModel, TFieldName> => {
    const snapshot = {} as Pick<PawnContractFormValueModel, TFieldName>;

    const assignFieldValue = <TField extends TFieldName>(field: TField): void => {
        snapshot[field] = form[field];
    };

    for (const field of fields) {
        assignFieldValue(field);
    }

    return snapshot;
};

const createAutoInsertTouchedSnapshot = <TFieldName extends PawnContractFormFieldName>(
    fields: readonly TFieldName[],
    touchedFields: PawnContractFormTouchedFieldMap
): Pick<PawnContractFormTouchedFieldMap, TFieldName> => {
    const snapshot = {} as Pick<PawnContractFormTouchedFieldMap, TFieldName>;

    const assignTouchedField = <TField extends TFieldName>(field: TField): void => {
        snapshot[field] = touchedFields[field];
    };

    for (const field of fields) {
        assignTouchedField(field);
    }

    return snapshot;
};

const createStepOneAutoInsertContent = (params: {
    itemKind: PawnContractItemKindEnum;
    itemDetailType: string;
    itemDetailPlaceholders: PawnContractItemDetailPlaceholderModel;
}): Pick<
    PawnContractFormValueModel,
    | 'itemName'
    | 'itemDetailFirst'
    | 'itemDetailSecond'
    | 'itemDetailThird'
    | 'accessorySummary'
    | 'issueSummary'
> => {
    if (params.itemKind === PawnContractItemKindEnum.Vehicle) {
        return {
            itemName: params.itemDetailType === 'mobil' ? 'Mobil keluarga 7 penumpang' : 'Motor matic harian 150cc',
            itemDetailFirst: removeExamplePrefix(params.itemDetailPlaceholders.first),
            itemDetailSecond: removeExamplePrefix(params.itemDetailPlaceholders.second),
            itemDetailThird: removeExamplePrefix(params.itemDetailPlaceholders.third),
            accessorySummary:
                params.itemDetailType === 'mobil'
                    ? 'STNK asli, kunci utama, kunci cadangan, buku servis'
                    : 'STNK asli, kunci utama, helm, kunci cadangan',
            issueSummary:
                params.itemDetailType === 'mobil'
                    ? 'Baret tipis pada bumper belakang, interior masih rapi'
                    : 'Baret halus pada bodi samping, ban belakang mulai menipis'
        };
    }

    return {
        itemName:
            params.itemDetailType === 'laptop'
                ? 'Laptop kerja tipis 14 inci'
                : params.itemDetailType === 'kamera'
                  ? 'Kamera mirrorless lensa kit'
                  : params.itemDetailType === 'tv'
                    ? 'Televisi smart 50 inci'
                    : 'Smartphone flagship 128GB',
        itemDetailFirst: removeExamplePrefix(params.itemDetailPlaceholders.first),
        itemDetailSecond: removeExamplePrefix(params.itemDetailPlaceholders.second),
        itemDetailThird: removeExamplePrefix(params.itemDetailPlaceholders.third),
        accessorySummary: 'Dus asli, charger, kabel data, nota pembelian',
        issueSummary: 'Lecet tipis pada sisi belakang, fungsi utama masih normal'
    };
};

export const createStepOneAutoInsertSnapshot = (params: {
    form: PawnContractFormValueModel;
    touchedFields: PawnContractFormTouchedFieldMap;
}): PawnContractStepOneAutoInsertSnapshotModel => ({
    values: createAutoInsertValueSnapshot(pawnContractStepOneAutoInsertFieldNames, params.form),
    touchedFields: createAutoInsertTouchedSnapshot(pawnContractStepOneAutoInsertFieldNames, params.touchedFields)
});

export const createStepTwoAutoInsertSnapshot = (params: {
    form: PawnContractFormValueModel;
    touchedFields: PawnContractFormTouchedFieldMap;
}): PawnContractStepTwoAutoInsertSnapshotModel => ({
    values: createAutoInsertValueSnapshot(pawnContractStepTwoAutoInsertFieldNames, params.form),
    touchedFields: createAutoInsertTouchedSnapshot(pawnContractStepTwoAutoInsertFieldNames, params.touchedFields)
});

export const createStepOneAutoInsertPatch = (params: {
    form: PawnContractFormValueModel;
    referenceData: PawnContractFormReferenceModel;
    currentPreset: PawnContractItemPresetModel | null;
    itemDetailPlaceholders: PawnContractItemDetailPlaceholderModel;
    availablePaymentOptions: Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>>;
    prepaidStorageOptions: number[];
}): Pick<PawnContractFormValueModel, PawnContractStepOneAutoInsertFieldName> => {
    const branchId = params.form.branchId > 0 ? params.form.branchId : params.referenceData.defaultBranchId ?? params.referenceData.branches[0]?.id ?? 0;
    const contractDate = params.form.contractDate || params.referenceData.defaultContractDate;
    const termDays = params.form.termDays;
    const itemKind = params.form.itemKind;
    const itemDetailType = params.form.itemDetailType || (params.currentPreset?.defaultDetailValue ?? '');
    const paymentOptionDays =
        params.availablePaymentOptions.find((option) => option.value === params.form.paymentOptionDays)?.value ??
        params.availablePaymentOptions[0]?.value ??
        PawnContractPaymentOptionDaysEnum.Daily;
    const prepaidStoragePeriods = params.prepaidStorageOptions.includes(params.form.prepaidStoragePeriods)
        ? params.form.prepaidStoragePeriods
        : 0;
    const branchBalance =
        params.referenceData.branches.find((branch) => branch.id === branchId)?.availableBalance ??
        params.referenceData.branches[0]?.availableBalance ??
        0;
    const appraisedValue = 5_000_000;
    const disbursedValue = Math.min(3_500_000, appraisedValue, Math.max(0, branchBalance));
    const detailContent = createStepOneAutoInsertContent({
        itemKind,
        itemDetailType,
        itemDetailPlaceholders: params.itemDetailPlaceholders
    });

    return {
        branchId,
        contractDate,
        termDays,
        itemName: detailContent.itemName,
        itemKind,
        itemDetailType,
        itemDetailFirst: detailContent.itemDetailFirst,
        itemDetailSecond: detailContent.itemDetailSecond,
        itemDetailThird: detailContent.itemDetailThird,
        accessorySummary: detailContent.accessorySummary,
        issueSummary: detailContent.issueSummary,
        appraisedValue,
        disbursedValue,
        paymentOptionDays,
        prepaidStoragePeriods
    };
};

export const createStepTwoAutoInsertPatch = (params: {
    referenceData: PawnContractFormReferenceModel;
}): Pick<PawnContractFormValueModel, PawnContractStepTwoAutoInsertFieldName> => {
    const existingCustomer = params.referenceData.customers[0];

    if (existingCustomer) {
        return {
            customerFullName: existingCustomer.fullName,
            customerGender: existingCustomer.gender,
            customerAddress: existingCustomer.address,
            customerCity: existingCustomer.city,
            customerPhone: existingCustomer.phoneNumber,
            customerIdentityType: existingCustomer.identityType ?? PawnContractIdentityTypeEnum.Ktp,
            customerIdentityNumber: existingCustomer.identityNumber ?? '7371123412340001',
            customerBirthDate: existingCustomer.birthDate ?? DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE
        };
    }

    return {
        customerFullName: 'Andi Saputra',
        customerGender: PawnContractCustomerGenderEnum.Male,
        customerAddress: 'Jl. Andi Pangeran Pettarani No. 88, Panakkukang',
        customerCity: 'Makassar',
        customerPhone: '081234567890',
        customerIdentityType: PawnContractIdentityTypeEnum.Ktp,
        customerIdentityNumber: '7371123412340001',
        customerBirthDate: '1995-08-17'
    };
};

const buildValidationErrorsFromFields = (params: {
    fields: PawnContractFormFieldName[];
    form: PawnContractFormValueModel;
    currentPreset: PawnContractItemPresetModel | null;
    selectedBranchAvailableBalance: number | null;
}): string[] => {
    const validationResult = validatePawnContractForm({
        form: params.form,
        currentPreset: params.currentPreset,
        selectedBranchAvailableBalance: params.selectedBranchAvailableBalance
    });

    return params.fields.reduce<string[]>((errors, field) => {
        const message = validationResult.fieldErrors[field];
        if (message && !errors.includes(message)) {
            errors.push(message);
        }

        return errors;
    }, []);
};

export const buildStepOneValidationErrors = (params: {
    form: PawnContractFormValueModel;
    currentPreset: PawnContractItemPresetModel | null;
    selectedBranchAvailableBalance: number | null;
}): string[] =>
    buildValidationErrorsFromFields({
        fields: pawnContractStepOneFieldNames,
        form: params.form,
        currentPreset: params.currentPreset,
        selectedBranchAvailableBalance: params.selectedBranchAvailableBalance
    });

export const buildStepTwoValidationErrors = (params: {
    form: PawnContractFormValueModel;
    currentPreset: PawnContractItemPresetModel | null;
    selectedBranchAvailableBalance: number | null;
}): string[] =>
    buildValidationErrorsFromFields({
        fields: pawnContractStepTwoFieldNames,
        form: params.form,
        currentPreset: params.currentPreset,
        selectedBranchAvailableBalance: params.selectedBranchAvailableBalance
    });

export const buildSavePawnContractPayload = (params: {
    contractId: number | null;
    form: PawnContractFormValueModel;
    maturityDate: string;
    storageFeeAmount: number;
    prepaidStorageAmount: number;
    prepaidStoragePeriodLabel: string;
    administrationFeeAmount: number;
    amountInWords: string;
}): SavePawnContractPayloadModel => ({
    contractId: params.contractId,
    contractNumber: params.form.contractNumber,
    branchId: params.form.branchId,
    contractDate: params.form.contractDate,
    maturityDate: params.maturityDate,
    termDays: params.form.termDays,
    itemName: params.form.itemName.trim(),
    itemKind: params.form.itemKind,
    itemDetailType: params.form.itemDetailType,
    itemDetailFirst: params.form.itemDetailFirst.trim(),
    itemDetailSecond: params.form.itemDetailSecond.trim(),
    itemDetailThird: params.form.itemDetailThird.trim(),
    accessorySummary: params.form.accessorySummary.trim(),
    issueSummary: params.form.issueSummary.trim(),
    appraisedValue: params.form.appraisedValue,
    disbursedValue: params.form.disbursedValue,
    paymentOptionDays: params.form.paymentOptionDays,
    storageFeeAmount: params.storageFeeAmount,
    prepaidStoragePeriods: params.form.prepaidStoragePeriods,
    prepaidStorageAmount: params.prepaidStorageAmount,
    prepaidStoragePeriodLabel: params.prepaidStoragePeriodLabel,
    administrationFeeAmount: params.administrationFeeAmount,
    amountInWords: params.amountInWords,
    customerLookupKey: params.form.customerLookupKey,
    customerFullName: params.form.customerFullName.trim(),
    customerGender: params.form.customerGender,
    customerAddress: params.form.customerAddress.trim(),
    customerCity: params.form.customerCity.trim(),
    customerPhone: params.form.customerPhone.trim(),
    customerIdentityType: params.form.customerIdentityType,
    customerIdentityNumber: params.form.customerIdentityNumber.trim(),
    customerBirthDate: params.form.customerBirthDate || null
});

export const buildPawnContractSummaryConfirmation = (
    params: PawnContractSummaryPresentationParams
): PawnContractStepConfirmationModel => {
    return {
        sections: [
            createConfirmationSection(
                'contract',
                'Informasi gadai',
                'Data kontrak dan waktu',
                'Pastikan nomor, cabang, dan periode gadai sudah sesuai sebelum melanjutkan.',
                'bi bi-receipt-cutoff',
                [
                    createConfirmationRow('contract-number', 'Nomor gadai', params.form.contractNumber),
                    createConfirmationRow('branch', 'Cabang aktif', params.selectedBranchName ?? '-'),
                    createConfirmationRow(
                        'branch-available-balance',
                        'Saldo cabang terpilih',
                        params.selectedBranchAvailableBalance !== null
                            ? params.formatCurrency(params.selectedBranchAvailableBalance)
                            : '-'
                    ),
                    createConfirmationRow('contract-date', 'Tanggal mulai gadai', params.formatDate(params.form.contractDate)),
                    createConfirmationRow('term-days', 'Durasi gadai', `${params.form.termDays} hari`),
                    createConfirmationRow('maturity-date', 'Jatuh tempo', params.formatDate(params.maturityDate))
                ]
            ),
            createConfirmationSection(
                'item',
                'Barang jaminan',
                'Profil barang yang disimpan',
                'Semua identitas barang, kelengkapan, dan catatan kondisi ditampilkan agar mudah dicek ulang.',
                'bi bi-box-seam',
                [
                    createConfirmationRow('item-name', 'Nama barang', params.form.itemName),
                    createConfirmationRow('item-kind', 'Kelompok barang', params.currentPresetLabel ?? '-'),
                    createConfirmationRow(
                        'item-detail-type',
                        'Jenis detail',
                        params.selectedDetailOptionLabel ?? '-',
                        `Margin ${params.selectedDetailMarginRate ?? 0}% | Potongan ${params.selectedDetailDeductionRate ?? 0}%`
                    ),
                    createConfirmationRow(
                        'item-detail-first',
                        params.currentPresetDetailLabels?.first ?? 'Detail pertama',
                        params.form.itemDetailFirst
                    ),
                    createConfirmationRow(
                        'item-detail-second',
                        params.currentPresetDetailLabels?.second ?? 'Detail kedua',
                        params.form.itemDetailSecond
                    ),
                    createConfirmationRow(
                        'item-detail-third',
                        params.currentPresetDetailLabels?.third ?? 'Detail ketiga',
                        params.form.itemDetailThird
                    ),
                    createConfirmationRow('accessory-summary', 'Kelengkapan barang', params.form.accessorySummary),
                    createConfirmationRow('issue-summary', 'Catatan kekurangan', params.form.issueSummary)
                ]
            ),
            createConfirmationSection(
                'finance',
                'Nilai dan biaya',
                'Rincian hitungan pencairan',
                'Nominal, skema biaya, dan total titip di muka dirangkum agar petugas tidak perlu bolak-balik ke form.',
                'bi bi-cash-coin',
                [
                    createConfirmationRow('appraised-value', 'Nilai taksiran', params.formatCurrency(params.form.appraisedValue)),
                    createConfirmationRow('disbursed-value', 'Dana pencairan', params.formatCurrency(params.form.disbursedValue)),
                    createConfirmationRow('amount-in-words', 'Terbilang', params.amountInWords),
                    createConfirmationRow(
                        'payment-option',
                        'Skema biaya titip',
                        formatPawnContractPaymentOptionLabel(params.selectedPaymentOptionLabel, params.form.paymentOptionDays),
                        params.selectedPaymentOptionHelper ?? undefined
                    ),
                    createConfirmationRow('storage-fee-amount', 'Biaya titip per periode', params.formatCurrency(params.storageFeeAmount)),
                    createConfirmationRow(
                        'prepaid-storage-periods',
                        'Titip dibayar di muka',
                        `${params.form.prepaidStoragePeriods} periode (${params.prepaidStoragePeriodLabel})`
                    ),
                    createConfirmationRow(
                        'prepaid-storage-amount',
                        'Total biaya titip di muka',
                        params.formatCurrency(params.prepaidStorageAmount)
                    ),
                    createConfirmationRow(
                        'customer-received-amount',
                        'Uang yang diberikan kepada nasabah',
                        params.formatCurrency(params.customerReceivedAmount),
                        'Dana pencairan setelah dikurangi biaya titip di muka dan biaya admin.',
                        'text-success'
                    ),
                    createConfirmationRow(
                        'administration-fee',
                        'Biaya admin',
                        params.formatCurrency(params.administrationFeeAmount)
                    ),
                    createConfirmationRow(
                        'projected-remaining-balance',
                        'Sisa saldo cabang setelah pencairan',
                        params.formatCurrency(params.projectedRemainingBalance)
                    )
                ]
            )
        ]
    };
};

export const buildPawnContractFinalConfirmation = (
    params: PawnContractFinalConfirmationPresentationParams
): PawnContractFinalConfirmationModel => {
    return {
        sections: [
            ...buildPawnContractSummaryConfirmation(params).sections,
            createConfirmationSection(
                'customer',
                'Data nasabah',
                'Identitas yang akan dipakai',
                params.customerLookupMessage,
                'bi bi-person-vcard',
                [
                    createConfirmationRow('customer-full-name', 'Nama lengkap', params.form.customerFullName),
                    createConfirmationRow('customer-gender', 'Jenis kelamin', params.customerGenderLabel),
                    createConfirmationRow(
                        'customer-birth-date',
                        'Tanggal lahir',
                        params.form.customerBirthDate ? params.formatDate(params.form.customerBirthDate) : '-'
                    ),
                    createConfirmationRow('customer-address', 'Alamat lengkap', params.form.customerAddress),
                    createConfirmationRow('customer-city', 'Kota / kabupaten', params.form.customerCity),
                    createConfirmationRow('customer-phone', 'Nomor telepon', params.form.customerPhone),
                    createConfirmationRow('customer-identity-type', 'Jenis identitas', params.form.customerIdentityType),
                    createConfirmationRow('customer-identity-number', 'Nomor identitas', params.form.customerIdentityNumber)
                ]
            )
        ],
        statusLabel: params.hasEnoughBalance ? 'Siap diproses' : 'Perlu penyesuaian',
        balanceMessage: params.hasEnoughBalance
            ? `Total saldo setelah gadai ini diperkirakan menjadi ${params.formatCurrency(params.projectedRemainingBalance)}.`
            : 'Dana pencairan melebihi saldo cabang aktif. Kurangi pencairan atau pilih cabang lain.',
        hasEnoughBalance: params.hasEnoughBalance
    };
};

export const resolveValidPaymentOptionDays = (params: {
    availableOptions: Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>>;
    currentValue: PawnContractPaymentOptionDaysEnum;
}): PawnContractPaymentOptionDaysEnum =>
    params.availableOptions.find((option) => option.value === params.currentValue)?.value ??
    params.availableOptions[0]?.value ??
    PawnContractPaymentOptionDaysEnum.Daily;

export const resolveValidPrepaidStoragePeriods = (params: {
    availableOptions: number[];
    currentValue: number;
}): number => (params.availableOptions.includes(params.currentValue) ? params.currentValue : 0);

export const resolveValidItemDetailType = (params: {
    currentPreset: PawnContractItemPresetModel | null;
    currentValue: string;
}): string => {
    if (
        params.currentPreset?.detailOptions.some((option) => option.value === params.currentValue) &&
        params.currentValue
    ) {
        return params.currentValue;
    }

    return params.currentPreset?.defaultDetailValue ?? '';
};

export const buildSaveSuccessMessage = (params: {
    isEditMode: boolean;
    result: SavePawnContractResultModel;
}): { title: string; message: string } => {
    if (params.isEditMode) {
        return {
            title: 'Perubahan data gadai berhasil disimpan',
            message: `Perubahan untuk nomor gadai ${params.result.contractNumber} sudah tersimpan.`
        };
    }

    return {
        title: 'Data gadai baru berhasil disimpan',
        message: `${params.result.usedExistingCustomer ? 'Nasabah lama dipakai kembali.' : 'Nasabah baru berhasil dibuat.'} Nomor gadai ${params.result.contractNumber} siap dilihat di daftar data gadai.`
    };
};

export const buildSaveFailureMessage = (params: {
    isEditMode: boolean;
    error: unknown;
}): { rawMessage: string; title: string; message: string } => {
    const rawMessage = createErrorMessage(params.error);

    return {
        rawMessage,
        title: 'Data gadai belum tersimpan',
        message:
            params.error instanceof Error
                ? params.error.message
                : params.isEditMode
                  ? 'Terjadi kendala saat menyimpan perubahan data gadai.'
                  : 'Terjadi kendala saat menyimpan data gadai baru.'
    };
};
