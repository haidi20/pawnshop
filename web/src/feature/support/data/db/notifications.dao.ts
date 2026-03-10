import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { notificationsTable, type NotificationsRow } from '@feature/support/data/db/notifications.table';

export class NotificationsDao extends FeatureTableDao<NotificationsRow> {
    constructor() {
        super(notificationsTable);
    }
}

export const notificationsDao = new NotificationsDao();
