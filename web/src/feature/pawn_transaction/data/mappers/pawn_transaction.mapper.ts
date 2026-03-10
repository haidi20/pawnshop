import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { ContractPaymentsRow, ContractExtensionsRow, AuctionTransactionsRow } from '@feature/pawn_transaction/data/db';
import { createPawnTransactionDataModel, type ContractPaymentModel, type ContractExtensionModel, type AuctionTransactionModel, type PawnTransactionDataModel } from '@feature/pawn_transaction/domain/models';

export const mapContractPaymentsRowToModel = (row: ContractPaymentsRow): ContractPaymentModel => ({
    id: row.id,
    contractId: row.contract_id,
    paymentType: row.payment_type,
    paymentReference: row.payment_reference,
    amount: row.amount,
    paymentDate: row.payment_date,
    notes: row.notes,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapContractExtensionsRowToModel = (row: ContractExtensionsRow): ContractExtensionModel => ({
    id: row.id,
    contractId: row.contract_id,
    extensionDate: row.extension_date,
    previousMaturityDate: row.previous_maturity_date,
    newMaturityDate: row.new_maturity_date,
    extensionTermDays: row.extension_term_days,
    extensionFeeAmount: row.extension_fee_amount,
    notes: row.notes,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapAuctionTransactionsRowToModel = (row: AuctionTransactionsRow): AuctionTransactionModel => ({
    id: row.id,
    contractId: row.contract_id,
    auctionDate: row.auction_date,
    overdueAmount: row.overdue_amount,
    auctionSaleAmount: row.auction_sale_amount,
    auctionFeeAmount: row.auction_fee_amount,
    refundAmount: row.refund_amount,
    notes: row.notes,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createPawnTransactionDataFromRows = (params: {
    module: AppModuleSummary;
    contractPaymentsRows: ContractPaymentsRow[];
    contractExtensionsRows: ContractExtensionsRow[];
    auctionTransactionsRows: AuctionTransactionsRow[];
}): PawnTransactionDataModel =>
    createPawnTransactionDataModel({
        module: params.module,
        contractPayments: params.contractPaymentsRows.map(mapContractPaymentsRowToModel),
        contractExtensions: params.contractExtensionsRows.map(mapContractExtensionsRowToModel),
        auctionTransactions: params.auctionTransactionsRows.map(mapAuctionTransactionsRowToModel),
    });
