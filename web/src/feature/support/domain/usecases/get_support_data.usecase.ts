import { left, type Either } from 'fp-ts/Either';
import { toError } from '@core/util/either';
import type { SupportDataModel } from '@feature/support/domain/models';
import type { SupportRepository } from '@feature/support/domain/repositories/support.repository';

export class GetSupportDataUsecase {
    constructor(private readonly repository: SupportRepository) {}

    async execute(): Promise<Either<Error, SupportDataModel>> {
        try {
            return await this.repository.getData();
        } catch (error) {
            return left(toError(error));
        }
    }
}
