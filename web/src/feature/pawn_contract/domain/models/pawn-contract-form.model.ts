import type { EnumOptionModel } from '@core/domain/models/enum-option.model';
import {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';

export {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';

export type PawnContractItemKindModel = PawnContractItemKindEnum;
export type PawnContractIdentityTypeModel = PawnContractIdentityTypeEnum;
export type PawnContractOptionModel<TValue extends string | number> = EnumOptionModel<TValue>;

export interface PawnContractBranchReferenceModel {
    id: number;
    branchCode: string;
    branchName: string;
    branchPhoneNumber: string | null;
    availableBalance: number;
    primaryCashAccountId: number | null;
}

export interface PawnContractCustomerLookupModel {
    id: number;
    customerCode: string;
    fullName: string;
    gender: PawnContractCustomerGenderEnum;
    birthDate: string | null;
    city: string;
    address: string;
    phoneNumber: string;
    identityType: PawnContractIdentityTypeModel | null;
    identityNumber: string | null;
}

export interface PawnContractItemTypeOptionModel {
    value: string;
    label: string;
    categoryId: number | null;
    itemTypeId: number | null;
    marginRate: number;
    deductionRate: number;
}

export interface PawnContractItemPresetModel {
    kind: PawnContractItemKindModel;
    label: string;
    description: string;
    administrationFeeAmount: number;
    defaultDetailValue: string;
    detailLabels: {
        first: string;
        second: string;
        third: string;
    };
    detailOptions: PawnContractItemTypeOptionModel[];
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

export interface PawnContractFormReferenceModel {
    nextContractNumber: string;
    defaultBranchId: number | null;
    defaultContractDate: string;
    termOptions: Array<PawnContractOptionModel<PawnContractTermDaysEnum>>;
    paymentOptions: Array<PawnContractOptionModel<PawnContractPaymentOptionDaysEnum>>;
    identityOptions: Array<PawnContractOptionModel<PawnContractIdentityTypeModel>>;
    branches: PawnContractBranchReferenceModel[];
    customers: PawnContractCustomerLookupModel[];
    itemPresets: Record<PawnContractItemKindModel, PawnContractItemPresetModel>;
}

export interface PawnContractFormValueModel {
    contractNumber: string;
    branchId: number;
    contractDate: string;
    termDays: PawnContractTermDaysEnum;
    itemName: string;
    itemKind: PawnContractItemKindModel;
    itemDetailType: string;
    itemDetailFirst: string;
    itemDetailSecond: string;
    itemDetailThird: string;
    accessorySummary: string;
    issueSummary: string;
    appraisedValue: number;
    disbursedValue: number;
    paymentOptionDays: PawnContractPaymentOptionDaysEnum;
    prepaidStoragePeriods: number;
    customerLookupKey: string;
    customerFullName: string;
    customerGender: PawnContractCustomerGenderEnum;
    customerAddress: string;
    customerCity: string;
    customerPhone: string;
    customerIdentityType: PawnContractIdentityTypeModel;
    customerIdentityNumber: string;
    customerBirthDate: string;
}

export interface SavePawnContractPayloadModel {
    contractId: number | null;
    contractNumber: string;
    branchId: number;
    contractDate: string;
    maturityDate: string;
    termDays: PawnContractTermDaysEnum;
    itemName: string;
    itemKind: PawnContractItemKindModel;
    itemDetailType: string;
    itemDetailFirst: string;
    itemDetailSecond: string;
    itemDetailThird: string;
    accessorySummary: string;
    issueSummary: string;
    appraisedValue: number;
    disbursedValue: number;
    paymentOptionDays: PawnContractPaymentOptionDaysEnum;
    storageFeeAmount: number;
    prepaidStoragePeriods: number;
    prepaidStorageAmount: number;
    prepaidStoragePeriodLabel: string;
    administrationFeeAmount: number;
    amountInWords: string;
    customerLookupKey: string;
    customerFullName: string;
    customerGender: PawnContractCustomerGenderEnum;
    customerAddress: string;
    customerCity: string;
    customerPhone: string;
    customerIdentityType: PawnContractIdentityTypeModel;
    customerIdentityNumber: string;
    customerBirthDate: string | null;
}

export interface SavePawnContractResultModel {
    contractId: number;
    contractNumber: string;
    customerId: number;
    customerName: string;
    branchId: number;
    branchName: string;
    disbursedValue: number;
    remainingBalance: number;
    usedExistingCustomer: boolean;
}
