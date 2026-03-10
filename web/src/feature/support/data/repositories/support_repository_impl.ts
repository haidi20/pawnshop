import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { notificationsDao, auditLogsDao } from '@feature/support/data/db';
import { SupportLocalDatasource } from '@feature/support/data/datasources/support_local_datasource';
import type { SupportDataModel } from '@feature/support/domain/models';
import type { SupportRepository } from '@feature/support/domain/repositories/support.repository';

export class SupportRepositoryImpl implements SupportRepository {
    constructor(private readonly localDataSource: SupportLocalDatasource) {}

    async getData(): Promise<SupportDataModel> {
        await seedFeatureTablesIfEmpty('SupportRepositoryImpl', [
            notificationsDao,
            auditLogsDao
        ]);

        return this.localDataSource.getData();
    }
}
