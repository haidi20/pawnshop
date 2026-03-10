export interface AuditLogModel {
    id: number;
    userId: number | null;
    entityType: string;
    entityId: number | null;
    actionType: string;
    ipAddress: string | null;
    actionAt: string;
    summary: string | null;
    metadataJson: Record<string, unknown> | null;
    createdAt: string | null;
}
