import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';
import type { MasterInvestorRepository } from '@feature/master_investor/domain/repositories/master_investor.repository';

export class GetMasterInvestorDataUsecase {
    constructor(private readonly repository: MasterInvestorRepository) {}

    async execute(): Promise<MasterInvestorDataModel> {
        return this.repository.getData();
    }
}
