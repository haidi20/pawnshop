import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import {
    createPawnContractDetailModels,
    type PawnContractDetailModel
} from '@feature/pawn_contract/domain/models/pawn-contract-detail.model';
import type {
    PawnContractBranchReferenceModel,
    PawnContractCustomerLookupModel
} from '@feature/pawn_contract/domain/models/pawn-contract-form.model';
import type { PawnContractModel } from '@feature/pawn_contract/domain/models/pawn-contract.model';
import type { PawnItemAccessoryModel } from '@feature/pawn_contract/domain/models/pawn-item-accessory.model';
import type { PawnItemIssueModel } from '@feature/pawn_contract/domain/models/pawn-item-issue.model';
import type { PawnItemLocationMovementModel } from '@feature/pawn_contract/domain/models/pawn-item-location-movement.model';
import type { PawnItemModel } from '@feature/pawn_contract/domain/models/pawn-item.model';

export interface PawnContractDataModel extends FeatureModuleDataModel {
    contracts: PawnContractModel[];
    items: PawnItemModel[];
    accessories: PawnItemAccessoryModel[];
    issues: PawnItemIssueModel[];
    locationMovements: PawnItemLocationMovementModel[];
    branches: PawnContractBranchReferenceModel[];
    customers: PawnContractCustomerLookupModel[];
    contractDetails: PawnContractDetailModel[];
    totalContracts: number;
    totalItems: number;
    totalAccessories: number;
    totalIssues: number;
    totalLocationMovements: number;
}

export const createPawnContractDataModel = (params: {
    module: AppModuleSummary;
    contracts: PawnContractModel[];
    items: PawnItemModel[];
    accessories: PawnItemAccessoryModel[];
    issues: PawnItemIssueModel[];
    locationMovements: PawnItemLocationMovementModel[];
    branches: PawnContractBranchReferenceModel[];
    customers: PawnContractCustomerLookupModel[];
}): PawnContractDataModel => {
    const contractDetails = createPawnContractDetailModels(
        params.contracts,
        params.items,
        params.accessories,
        params.issues,
        params.locationMovements
    );

    const tableCounts: FeatureTableCountModel[] = [
        { key: 'pawn_contracts', label: 'Pawn Contracts', count: params.contracts.length },
        { key: 'pawn_items', label: 'Pawn Items', count: params.items.length },
        { key: 'pawn_item_accessories', label: 'Pawn Item Accessories', count: params.accessories.length },
        { key: 'pawn_item_issues', label: 'Pawn Item Issues', count: params.issues.length },
        {
            key: 'pawn_item_location_movements',
            label: 'Pawn Item Location Movements',
            count: params.locationMovements.length
        }
    ];

    return {
        ...params,
        contractDetails,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0),
        totalContracts: params.contracts.length,
        totalItems: params.items.length,
        totalAccessories: params.accessories.length,
        totalIssues: params.issues.length,
        totalLocationMovements: params.locationMovements.length
    };
};
