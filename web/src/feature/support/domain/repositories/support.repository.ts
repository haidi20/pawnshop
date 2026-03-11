import type { Either } from 'fp-ts/Either';
import type { SupportDataModel } from '@feature/support/domain/models';

export interface SupportRepository {
    getData(): Promise<Either<Error, SupportDataModel>>;
}
