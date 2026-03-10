import type { PawnContractFormValueModel } from '@feature/pawn_contract/domain/models';

export interface PawnContractCustomerSuggestionOptionModel {
    key: string;
    value: string;
    label: string;
}

export interface PawnContractItemDetailPlaceholderModel {
    first: string;
    second: string;
    third: string;
}

export type PawnContractFormFieldName = keyof PawnContractFormValueModel;

export type PawnContractFormFieldErrorMap = Record<PawnContractFormFieldName, string | null>;

export type PawnContractFormTouchedFieldMap = Record<PawnContractFormFieldName, boolean>;

export type PawnContractStepOneAutoInsertFieldName =
    | 'branchId'
    | 'contractDate'
    | 'termDays'
    | 'itemName'
    | 'itemKind'
    | 'itemDetailType'
    | 'itemDetailFirst'
    | 'itemDetailSecond'
    | 'itemDetailThird'
    | 'accessorySummary'
    | 'issueSummary'
    | 'appraisedValue'
    | 'disbursedValue'
    | 'paymentOptionDays'
    | 'prepaidStoragePeriods';

export interface PawnContractStepOneAutoInsertSnapshotModel {
    values: Pick<PawnContractFormValueModel, PawnContractStepOneAutoInsertFieldName>;
    touchedFields: Pick<PawnContractFormTouchedFieldMap, PawnContractStepOneAutoInsertFieldName>;
}

export type PawnContractStepTwoAutoInsertFieldName =
    | 'customerFullName'
    | 'customerGender'
    | 'customerAddress'
    | 'customerCity'
    | 'customerPhone'
    | 'customerIdentityType'
    | 'customerIdentityNumber'
    | 'customerBirthDate';

export interface PawnContractStepTwoAutoInsertSnapshotModel {
    values: Pick<PawnContractFormValueModel, PawnContractStepTwoAutoInsertFieldName>;
    touchedFields: Pick<PawnContractFormTouchedFieldMap, PawnContractStepTwoAutoInsertFieldName>;
}

export type PawnContractFormFieldUpdater = <TField extends keyof PawnContractFormValueModel>(
    field: TField,
    value: PawnContractFormValueModel[TField]
) => void;
