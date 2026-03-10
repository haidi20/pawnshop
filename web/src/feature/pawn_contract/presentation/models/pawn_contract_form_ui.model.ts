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

export type PawnContractFormFieldUpdater = <TField extends keyof PawnContractFormValueModel>(
    field: TField,
    value: PawnContractFormValueModel[TField]
) => void;
