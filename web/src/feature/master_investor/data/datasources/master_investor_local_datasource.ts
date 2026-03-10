import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { investorsDao, branchInvestorsDao, investorCapitalTransactionsDao } from '@feature/master_investor/data/db';
import { createMasterInvestorDataFromRows } from '@feature/master_investor/data/mappers/master_investor.mapper';
import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';

export class MasterInvestorLocalDatasource {
    async getData(): Promise<MasterInvestorDataModel> {
        const [
            investorsRows,
            branchInvestorsRows,
            investorCapitalTransactionsRows
        ] = await Promise.all([
            investorsDao.getAll(),
            branchInvestorsDao.getAll(),
            investorCapitalTransactionsDao.getAll()
        ]);

        return createMasterInvestorDataFromRows({
            module: getAppModuleByKey('master-investor'),
            investorsRows,
            branchInvestorsRows,
            investorCapitalTransactionsRows,
        });
    }
}
