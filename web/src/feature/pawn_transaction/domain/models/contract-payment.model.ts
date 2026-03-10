export interface ContractPaymentModel {
    id: number;
    contractId: number;
    paymentType: string;
    paymentReference: string | null;
    amount: number;
    paymentDate: string;
    notes: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
