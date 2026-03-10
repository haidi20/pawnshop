import type { PawnContractModel } from '@feature/pawn_contract/domain/models/pawn-contract.model';
import type { PawnItemAccessoryModel } from '@feature/pawn_contract/domain/models/pawn-item-accessory.model';
import type { PawnItemIssueModel } from '@feature/pawn_contract/domain/models/pawn-item-issue.model';
import type { PawnItemLocationMovementModel } from '@feature/pawn_contract/domain/models/pawn-item-location-movement.model';
import type { PawnItemModel } from '@feature/pawn_contract/domain/models/pawn-item.model';

export interface PawnContractItemDetailModel {
    item: PawnItemModel;
    accessories: PawnItemAccessoryModel[];
    issues: PawnItemIssueModel[];
    locationMovements: PawnItemLocationMovementModel[];
}

export interface PawnContractDetailModel {
    contract: PawnContractModel;
    items: PawnContractItemDetailModel[];
    totalItems: number;
    totalQuantity: number;
    totalAccessories: number;
    totalIssues: number;
    totalLocationMovements: number;
}

export const createPawnContractDetailModels = (
    contracts: PawnContractModel[],
    items: PawnItemModel[],
    accessories: PawnItemAccessoryModel[],
    issues: PawnItemIssueModel[],
    locationMovements: PawnItemLocationMovementModel[]
): PawnContractDetailModel[] =>
    contracts.map((contract) => {
        const contractItems = items.filter((item) => item.contractId === contract.id);
        const itemDetails = contractItems.map((item) => ({
            item,
            accessories: accessories.filter((accessory) => accessory.pawnItemId === item.id),
            issues: issues.filter((issue) => issue.pawnItemId === item.id),
            locationMovements: locationMovements.filter((movement) => movement.pawnItemId === item.id)
        }));

        return {
            contract,
            items: itemDetails,
            totalItems: itemDetails.length,
            totalQuantity: itemDetails.reduce((total, itemDetail) => total + itemDetail.item.quantity, 0),
            totalAccessories: itemDetails.reduce((total, itemDetail) => total + itemDetail.accessories.length, 0),
            totalIssues: itemDetails.reduce((total, itemDetail) => total + itemDetail.issues.length, 0),
            totalLocationMovements: itemDetails.reduce(
                (total, itemDetail) => total + itemDetail.locationMovements.length,
                0
            )
        };
    });
