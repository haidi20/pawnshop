import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { NotificationModel } from '@feature/support/domain/models/notification.model';
import type { AuditLogModel } from '@feature/support/domain/models/audit-log.model';

export interface SupportDataModel extends FeatureModuleDataModel {
    notifications: NotificationModel[];
    auditLogs: AuditLogModel[];
}

export const createSupportDataModel = (params: {
    module: AppModuleSummary;
    notifications: NotificationModel[];
    auditLogs: AuditLogModel[];
}): SupportDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'notifications', label: 'Notifications', count: params.notifications.length },
        { key: 'audit_logs', label: 'Audit Logs', count: params.auditLogs.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
