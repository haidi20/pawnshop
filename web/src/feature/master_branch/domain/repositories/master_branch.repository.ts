import type { Either } from 'fp-ts/Either';
import type {
    MasterBranchDataModel,
    MasterBranchUpsertPayloadModel,
    MasterLocationUpsertPayloadModel
} from '@feature/master_branch/domain/models';

export interface MasterBranchRepository {
    getData(): Promise<Either<Error, MasterBranchDataModel>>;
    saveBranch(payload: MasterBranchUpsertPayloadModel): Promise<Either<Error, void>>;
    deleteBranch(branchId: number): Promise<Either<Error, void>>;
    saveLocation(payload: MasterLocationUpsertPayloadModel): Promise<Either<Error, void>>;
    deleteLocation(locationId: number): Promise<Either<Error, void>>;
}
