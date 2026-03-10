import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { notificationsDao, auditLogsDao } from '@feature/support/data/db';
import { createSupportDataFromRows } from '@feature/support/data/mappers/support.mapper';
import type { SupportDataModel } from '@feature/support/domain/models';

export class SupportLocalDatasource {
    async getData(): Promise<SupportDataModel> {
        const [
            notificationsRows,
            auditLogsRows
        ] = await Promise.all([
            notificationsDao.getAll(),
            auditLogsDao.getAll()
        ]);

        return createSupportDataFromRows({
            module: getAppModuleByKey('support'),
            notificationsRows,
            auditLogsRows,
        });
    }
}
