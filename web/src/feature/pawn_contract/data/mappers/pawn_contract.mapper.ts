import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type {
    PawnContractsRow,
    PawnItemAccessoriesRow,
    PawnItemIssuesRow,
    PawnItemLocationMovementsRow,
    PawnItemsRow
} from '@feature/pawn_contract/data/db';
import {
    createPawnContractDataModel,
    type PawnContractDataModel,
    type PawnContractModel,
    type PawnItemAccessoryModel,
    type PawnItemIssueModel,
    type PawnItemLocationMovementModel,
    type PawnItemModel
} from '@feature/pawn_contract/domain/models';

export const mapPawnContractRowToModel = (row: PawnContractsRow): PawnContractModel => ({
    id: row.id,
    contractNumber: row.contract_number,
    branchId: row.branch_id,
    customerId: row.customer_id,
    contractDate: row.contract_date,
    maturityDate: row.maturity_date,
    termDays: row.term_days,
    appraisedValue: row.appraised_value,
    disbursedValue: row.disbursed_value,
    storageFeeAmount: row.storage_fee_amount,
    administrationFeeAmount: row.administration_fee_amount,
    paymentOptionDays: row.payment_option_days,
    amountInWords: row.amount_in_words,
    contractStatus: row.contract_status,
    maintenanceRequired: row.maintenance_required === 1,
    maintenanceReport: row.maintenance_report,
    notes: row.notes,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const mapPawnItemRowToModel = (row: PawnItemsRow): PawnItemModel => ({
    id: row.id,
    contractId: row.contract_id,
    itemSequence: row.item_sequence,
    itemName: row.item_name,
    categoryId: row.category_id,
    itemTypeId: row.item_type_id,
    brandName: row.brand_name,
    modelName: row.model_name,
    serialNumber: row.serial_number,
    itemDescription: row.item_description,
    quantity: row.quantity,
    appraisedValue: row.appraised_value,
    disbursedValue: row.disbursed_value,
    conditionNotes: row.condition_notes,
    missingNotes: row.missing_notes,
    specificationJson: row.specification_json,
    currentLocationId: row.current_location_id,
    currentLocationStatus: row.current_location_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const mapPawnItemAccessoryRowToModel = (
    row: PawnItemAccessoriesRow
): PawnItemAccessoryModel => ({
    id: row.id,
    pawnItemId: row.pawn_item_id,
    accessoryName: row.accessory_name,
    accessoryCondition: row.accessory_condition,
    notes: row.notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const mapPawnItemIssueRowToModel = (row: PawnItemIssuesRow): PawnItemIssueModel => ({
    id: row.id,
    pawnItemId: row.pawn_item_id,
    issueName: row.issue_name,
    issueDetails: row.issue_details,
    severityLevel: row.severity_level,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const mapPawnItemLocationMovementRowToModel = (
    row: PawnItemLocationMovementsRow
): PawnItemLocationMovementModel => ({
    id: row.id,
    pawnItemId: row.pawn_item_id,
    fromLocationId: row.from_location_id,
    toLocationId: row.to_location_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    movedAt: row.moved_at,
    movedByUserId: row.moved_by_user_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const createPawnContractDataFromRows = (params: {
    module: AppModuleSummary;
    contractRows: PawnContractsRow[];
    itemRows: PawnItemsRow[];
    accessoryRows: PawnItemAccessoriesRow[];
    issueRows: PawnItemIssuesRow[];
    locationMovementRows: PawnItemLocationMovementsRow[];
}): PawnContractDataModel =>
    createPawnContractDataModel({
        module: params.module,
        contracts: params.contractRows.map(mapPawnContractRowToModel),
        items: params.itemRows.map(mapPawnItemRowToModel),
        accessories: params.accessoryRows.map(mapPawnItemAccessoryRowToModel),
        issues: params.issueRows.map(mapPawnItemIssueRowToModel),
        locationMovements: params.locationMovementRows.map(mapPawnItemLocationMovementRowToModel)
    });
