import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';
import type { MasterInvestorRepository } from '@feature/master_investor/domain/repositories/master_investor.repository';

export class GetMasterInvestorDataUsecase {
    constructor(private readonly repository: MasterInvestorRepository) {}

    async execute(): Promise<Either<Error, MasterInvestorDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
