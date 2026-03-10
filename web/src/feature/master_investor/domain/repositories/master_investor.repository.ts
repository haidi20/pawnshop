import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';

export interface MasterInvestorRepository {
    getData(): Promise<MasterInvestorDataModel>;
}
