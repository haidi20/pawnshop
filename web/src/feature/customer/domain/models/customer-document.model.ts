export interface CustomerDocumentModel {
    id: number;
    customerId: number;
    documentType: string;
    documentNumber: string;
    isPrimary: boolean;
    issuedDate: string | null;
    expiredDate: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
