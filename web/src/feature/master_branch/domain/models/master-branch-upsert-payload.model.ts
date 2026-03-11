export interface MasterBranchUpsertPayloadModel {
    id?: number;
    branchCode: string;
    branchNumber: string | null;
    branchName: string;
    phoneNumber: string | null;
    address: string | null;
    isActive: boolean;
}
