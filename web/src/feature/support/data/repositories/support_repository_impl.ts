import { left, right, type Either } from 'fp-ts/Either';
import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { toError } from '@core/util/either';
import { notificationsDao, auditLogsDao } from '@feature/support/data/db';
import { SupportLocalDatasource } from '@feature/support/data/datasources/support_local_datasource';
import type { SupportDataModel } from '@feature/support/domain/models';
import type { SupportRepository } from '@feature/support/domain/repositories/support.repository';

export class SupportRepositoryImpl implements SupportRepository {
    constructor(private readonly localDataSource: SupportLocalDatasource) {}

    async getData(): Promise<Either<Error, SupportDataModel>> {
        try {
            await seedFeatureTablesIfEmpty('SupportRepositoryImpl', [
                notificationsDao,
                auditLogsDao
            ]);

            return right(await this.localDataSource.getData());
        } catch (error) {
            return left(toError(error));
        }
    }
}
