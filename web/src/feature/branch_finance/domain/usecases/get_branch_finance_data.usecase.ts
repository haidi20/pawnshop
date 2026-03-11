import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { BranchFinanceDataModel } from '@feature/branch_finance/domain/models';
import type { BranchFinanceRepository } from '@feature/branch_finance/domain/repositories/branch_finance.repository';

export class GetBranchFinanceDataUsecase {
    constructor(private readonly repository: BranchFinanceRepository) {}

    async execute(): Promise<Either<Error, BranchFinanceDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
