export interface BranchCashAccountModel {
    id: number;
    branchId: number;
    accountCode: string;
    accountName: string;
    accountType: string;
    currentBalance: number;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
