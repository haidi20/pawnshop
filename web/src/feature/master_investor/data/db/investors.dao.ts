import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { investorsTable, type InvestorsRow } from '@feature/master_investor/data/db/investors.table';

export class InvestorsDao extends FeatureTableDao<InvestorsRow> {
    constructor() {
        super(investorsTable);
    }
}

export const investorsDao = new InvestorsDao();
