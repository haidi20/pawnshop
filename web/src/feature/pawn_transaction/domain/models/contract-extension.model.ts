export interface ContractExtensionModel {
    id: number;
    contractId: number;
    extensionDate: string;
    previousMaturityDate: string;
    newMaturityDate: string;
    extensionTermDays: number;
    extensionFeeAmount: number;
    notes: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
