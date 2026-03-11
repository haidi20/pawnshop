import type { Either } from 'fp-ts/Either';
import type { MasterInvestorDataModel } from '@feature/master_investor/domain/models';

export interface MasterInvestorRepository {
    getData(): Promise<Either<Error, MasterInvestorDataModel>>;
}
