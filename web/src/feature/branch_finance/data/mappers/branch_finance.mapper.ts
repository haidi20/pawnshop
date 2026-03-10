import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { BranchCashAccountsRow, BranchCashTransactionsRow, BranchDebtsRow, BranchDebtPaymentsRow, InterBranchTransfersRow } from '@feature/branch_finance/data/db';
import { createBranchFinanceDataModel, type BranchCashAccountModel, type BranchCashTransactionModel, type BranchDebtModel, type BranchDebtPaymentModel, type InterBranchTransferModel, type BranchFinanceDataModel } from '@feature/branch_finance/domain/models';

export const mapBranchCashAccountsRowToModel = (row: BranchCashAccountsRow): BranchCashAccountModel => ({
    id: row.id,
    branchId: row.branch_id,
    accountCode: row.account_code,
    accountName: row.account_name,
    accountType: row.account_type,
    currentBalance: row.current_balance,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapBranchCashTransactionsRowToModel = (row: BranchCashTransactionsRow): BranchCashTransactionModel => ({
    id: row.id,
    branchId: row.branch_id,
    cashAccountId: row.cash_account_id,
    transactionTypeCode: row.transaction_type_code,
    referenceTable: row.reference_table,
    referenceId: row.reference_id,
    entryDirection: row.entry_direction,
    amount: row.amount,
    transactionDate: row.transaction_date,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapBranchDebtsRowToModel = (row: BranchDebtsRow): BranchDebtModel => ({
    id: row.id,
    branchId: row.branch_id,
    creditorBranchId: row.creditor_branch_id,
    debtSourceType: row.debt_source_type,
    debtReferenceNumber: row.debt_reference_number,
    debtDate: row.debt_date,
    principalAmount: row.principal_amount,
    outstandingAmount: row.outstanding_amount,
    dueDate: row.due_date,
    debtStatus: row.debt_status,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapBranchDebtPaymentsRowToModel = (row: BranchDebtPaymentsRow): BranchDebtPaymentModel => ({
    id: row.id,
    debtId: row.debt_id,
    paymentDate: row.payment_date,
    amount: row.amount,
    notes: row.notes,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapInterBranchTransfersRowToModel = (row: InterBranchTransfersRow): InterBranchTransferModel => ({
    id: row.id,
    sourceBranchId: row.source_branch_id,
    targetBranchId: row.target_branch_id,
    transferNumber: row.transfer_number,
    transferDate: row.transfer_date,
    amount: row.amount,
    transferStatus: row.transfer_status,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createBranchFinanceDataFromRows = (params: {
    module: AppModuleSummary;
    branchCashAccountsRows: BranchCashAccountsRow[];
    branchCashTransactionsRows: BranchCashTransactionsRow[];
    branchDebtsRows: BranchDebtsRow[];
    branchDebtPaymentsRows: BranchDebtPaymentsRow[];
    interBranchTransfersRows: InterBranchTransfersRow[];
}): BranchFinanceDataModel =>
    createBranchFinanceDataModel({
        module: params.module,
        branchCashAccounts: params.branchCashAccountsRows.map(mapBranchCashAccountsRowToModel),
        branchCashTransactions: params.branchCashTransactionsRows.map(mapBranchCashTransactionsRowToModel),
        branchDebts: params.branchDebtsRows.map(mapBranchDebtsRowToModel),
        branchDebtPayments: params.branchDebtPaymentsRows.map(mapBranchDebtPaymentsRowToModel),
        interBranchTransfers: params.interBranchTransfersRows.map(mapInterBranchTransfersRowToModel),
    });
