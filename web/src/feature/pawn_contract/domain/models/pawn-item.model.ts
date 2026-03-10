import type { PawnItemLocationStatusModel } from '@core/util/helpers';
import type { PawnContractItemKindModel } from '@feature/pawn_contract/domain/models/pawn-contract-form.model';

export {
    pawnItemLocationStatusLabelMap,
    pawnItemLocationStatusOptions,
    type PawnItemLocationStatusModel
} from '@core/util/helpers';

export interface PawnItemSpecificationDetailValueModel {
    first?: string;
    second?: string;
    third?: string;
}

export interface PawnItemSpecificationModel {
    customer_lookup_key?: string;
    item_kind?: PawnContractItemKindModel | null;
    item_detail_type?: string;
    item_detail_values?: PawnItemSpecificationDetailValueModel;
    prepaid_storage_periods?: number;
    prepaid_storage_amount?: number;
    prepaid_storage_label?: string;
    branch_margin_rate?: number | null;
    branch_deduction_rate?: number | null;
}

export interface PawnItemModel {
    id: number;
    contractId: number;
    itemSequence: number;
    itemName: string;
    categoryId: number | null;
    itemTypeId: number | null;
    brandName: string | null;
    modelName: string | null;
    serialNumber: string | null;
    itemDescription: string | null;
    quantity: number;
    appraisedValue: number;
    disbursedValue: number;
    conditionNotes: string | null;
    missingNotes: string | null;
    specificationJson: PawnItemSpecificationModel | null;
    currentLocationId: number | null;
    currentLocationStatus: PawnItemLocationStatusModel;
    createdAt: string | null;
    updatedAt: string | null;
}
