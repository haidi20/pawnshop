import type { Either } from 'fp-ts/Either';
import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';

export interface BranchFinanceRepository {
    getData(): Promise<Either<Error, BranchFinanceDataModel>>;
}
