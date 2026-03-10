import type { PawnContractStatusModel } from '@core/util/helpers';

export interface PawnContractDataFilterModel {
    branchId: number | null;
    contractStatus: PawnContractStatusModel | null;
    onlyOpenContracts: boolean;
    dueWithinDays: number | null;
    maintenanceRequired: boolean;
    warehouseOnly: boolean;
}
