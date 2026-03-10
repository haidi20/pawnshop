export interface BranchInvestorModel {
    id: number;
    branchId: number;
    investorId: number;
    ownershipPercentage: number | null;
    startDate: string;
    endDate: string | null;
    isPrimary: boolean;
    notes: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
