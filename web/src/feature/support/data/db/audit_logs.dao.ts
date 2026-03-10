import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { auditLogsTable, type AuditLogsRow } from '@feature/support/data/db/audit_logs.table';

export class AuditLogsDao extends FeatureTableDao<AuditLogsRow> {
    constructor() {
        super(auditLogsTable);
    }
}

export const auditLogsDao = new AuditLogsDao();
