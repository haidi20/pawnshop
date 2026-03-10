import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { investorCapitalTransactionsTable, type InvestorCapitalTransactionsRow } from '@feature/master_investor/data/db/investor_capital_transactions.table';

export class InvestorCapitalTransactionsDao extends FeatureTableDao<InvestorCapitalTransactionsRow> {
    constructor() {
        super(investorCapitalTransactionsTable);
    }
}

export const investorCapitalTransactionsDao = new InvestorCapitalTransactionsDao();
