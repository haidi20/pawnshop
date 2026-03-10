import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { InvestorModel } from '@feature/master_investor/domain/models/investor.model';
import type { BranchInvestorModel } from '@feature/master_investor/domain/models/branch-investor.model';
import type { InvestorCapitalTransactionModel } from '@feature/master_investor/domain/models/investor-capital-transaction.model';

export interface MasterInvestorDataModel extends FeatureModuleDataModel {
    investors: InvestorModel[];
    branchInvestors: BranchInvestorModel[];
    investorCapitalTransactions: InvestorCapitalTransactionModel[];
}

export const createMasterInvestorDataModel = (params: {
    module: AppModuleSummary;
    investors: InvestorModel[];
    branchInvestors: BranchInvestorModel[];
    investorCapitalTransactions: InvestorCapitalTransactionModel[];
}): MasterInvestorDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'investors', label: 'Investors', count: params.investors.length },
        { key: 'branch_investors', label: 'Branch Investors', count: params.branchInvestors.length },
        { key: 'investor_capital_transactions', label: 'Investor Capital Transactions', count: params.investorCapitalTransactions.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
