export interface NotificationModel {
    id: number;
    branchId: number | null;
    customerId: number | null;
    contractId: number | null;
    notificationType: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    readByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
