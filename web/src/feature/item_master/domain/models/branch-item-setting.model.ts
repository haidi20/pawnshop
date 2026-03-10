export interface BranchItemSettingModel {
    id: number;
    branchId: number;
    itemTypeId: number;
    marginRate: number;
    deductionRate: number;
    effectiveFrom: string;
    effectiveUntil: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
