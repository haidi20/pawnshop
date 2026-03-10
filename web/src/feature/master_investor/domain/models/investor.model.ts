export interface InvestorModel {
    id: number;
    investorCode: string;
    fullName: string;
    phoneNumber: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
