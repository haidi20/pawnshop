export interface BranchDebtPaymentModel {
    id: number;
    debtId: number;
    paymentDate: string;
    amount: number;
    notes: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
