import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { NotificationsRow, AuditLogsRow } from '@feature/support/data/db';
import { createSupportDataModel, type NotificationModel, type AuditLogModel, type SupportDataModel } from '@feature/support/domain/models';

export const mapNotificationsRowToModel = (row: NotificationsRow): NotificationModel => ({
    id: row.id,
    branchId: row.branch_id,
    customerId: row.customer_id,
    contractId: row.contract_id,
    notificationType: row.notification_type,
    message: row.message,
    isRead: row.is_read === 1,
    readAt: row.read_at,
    readByUserId: row.read_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapAuditLogsRowToModel = (row: AuditLogsRow): AuditLogModel => ({
    id: row.id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actionType: row.action_type,
    ipAddress: row.ip_address,
    actionAt: row.action_at,
    summary: row.summary,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
});

export const createSupportDataFromRows = (params: {
    module: AppModuleSummary;
    notificationsRows: NotificationsRow[];
    auditLogsRows: AuditLogsRow[];
}): SupportDataModel =>
    createSupportDataModel({
        module: params.module,
        notifications: params.notificationsRows.map(mapNotificationsRowToModel),
        auditLogs: params.auditLogsRows.map(mapAuditLogsRowToModel),
    });
