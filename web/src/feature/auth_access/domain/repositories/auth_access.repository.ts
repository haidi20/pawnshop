import type { Either } from 'fp-ts/Either';
import type { AuthAccessDataModel } from '@feature/auth_access/domain/models';

export interface AuthAccessRepository {
    getData(): Promise<Either<Error, AuthAccessDataModel>>;
}
