export interface InvestorCapitalTransactionModel {
    id: number;
    investorId: number;
    branchId: number;
    transferId: number | null;
    transactionTypeCode: string;
    transactionDate: string;
    amount: number;
    description: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
