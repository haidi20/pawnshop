export interface CustomerContactModel {
    id: number;
    customerId: number;
    contactType: string;
    contactValue: string;
    isPrimary: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
