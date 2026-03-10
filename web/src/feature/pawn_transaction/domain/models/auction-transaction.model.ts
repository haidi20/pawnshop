export interface AuctionTransactionModel {
    id: number;
    contractId: number;
    auctionDate: string;
    overdueAmount: number;
    auctionSaleAmount: number;
    auctionFeeAmount: number;
    refundAmount: number;
    notes: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
