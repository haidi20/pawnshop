export interface BranchModel {
    id: number;
    branchCode: string;
    branchNumber: string | null;
    branchName: string;
    phoneNumber: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
