import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { BranchCashAccountModel } from '@feature/branch_finance/domain/models/branch-cash-account.model';
import type { BranchCashTransactionModel } from '@feature/branch_finance/domain/models/branch-cash-transaction.model';
import type { BranchDebtModel } from '@feature/branch_finance/domain/models/branch-debt.model';
import type { BranchDebtPaymentModel } from '@feature/branch_finance/domain/models/branch-debt-payment.model';
import type { InterBranchTransferModel } from '@feature/branch_finance/domain/models/inter-branch-transfer.model';

export interface BranchFinanceDataModel extends FeatureModuleDataModel {
    branchCashAccounts: BranchCashAccountModel[];
    branchCashTransactions: BranchCashTransactionModel[];
    branchDebts: BranchDebtModel[];
    branchDebtPayments: BranchDebtPaymentModel[];
    interBranchTransfers: InterBranchTransferModel[];
}

export const createBranchFinanceDataModel = (params: {
    module: AppModuleSummary;
    branchCashAccounts: BranchCashAccountModel[];
    branchCashTransactions: BranchCashTransactionModel[];
    branchDebts: BranchDebtModel[];
    branchDebtPayments: BranchDebtPaymentModel[];
    interBranchTransfers: InterBranchTransferModel[];
}): BranchFinanceDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'branch_cash_accounts', label: 'Branch Cash Accounts', count: params.branchCashAccounts.length },
        { key: 'branch_cash_transactions', label: 'Branch Cash Transactions', count: params.branchCashTransactions.length },
        { key: 'branch_debts', label: 'Branch Debts', count: params.branchDebts.length },
        { key: 'branch_debt_payments', label: 'Branch Debt Payments', count: params.branchDebtPayments.length },
        { key: 'inter_branch_transfers', label: 'Inter Branch Transfers', count: params.interBranchTransfers.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
