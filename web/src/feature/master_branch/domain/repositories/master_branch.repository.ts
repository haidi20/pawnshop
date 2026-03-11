import type { Either } from 'fp-ts/Either';
import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';

export interface MasterBranchRepository {
    getData(): Promise<Either<Error, MasterBranchDataModel>>;
}
