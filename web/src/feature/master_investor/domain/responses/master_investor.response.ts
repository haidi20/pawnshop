import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';

export interface IMasterInvestorResponse {
    success: boolean;
    data: MasterInvestorDataModel;
    message: string;
}
