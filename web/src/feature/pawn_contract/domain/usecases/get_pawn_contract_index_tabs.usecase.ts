import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type {
    GetPawnContractIndexTabsParamsModel,
    PawnContractIndexTabModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';

export class GetPawnContractIndexTabsUsecase {
    constructor(private readonly repository: PawnContractRepository) {}

    execute(params: GetPawnContractIndexTabsParamsModel): Either<Error, PawnContractIndexTabModel[]> {
        try {
            return this.repository.getIndexTabs(params);
        } catch (error) {
            return left(toError(error));
        }
    }
}
