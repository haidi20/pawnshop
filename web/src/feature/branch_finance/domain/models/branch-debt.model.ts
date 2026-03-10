import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

export type BranchDebtDebtStatusModel =
    'open' |
    'partially_paid' |
    'paid' |
    'cancelled';

export const branchDebtDebtStatusLabelMap: Record<BranchDebtDebtStatusModel, string> = {
    'open': 'Terbuka',
    'partially_paid': 'Dibayar sebagian',
    'paid': 'Lunas',
    'cancelled': 'Dibatalkan',
};

export const branchDebtDebtStatusOptions: EnumOptionModel<BranchDebtDebtStatusModel>[] = [
    { value: 'open', label: branchDebtDebtStatusLabelMap['open'] },
    { value: 'partially_paid', label: branchDebtDebtStatusLabelMap['partially_paid'] },
    { value: 'paid', label: branchDebtDebtStatusLabelMap['paid'] },
    { value: 'cancelled', label: branchDebtDebtStatusLabelMap['cancelled'] },
];

export interface BranchDebtModel {
    id: number;
    branchId: number;
    creditorBranchId: number | null;
    debtSourceType: string;
    debtReferenceNumber: string | null;
    debtDate: string;
    principalAmount: number;
    outstandingAmount: number;
    dueDate: string | null;
    debtStatus: BranchDebtDebtStatusModel;
    description: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
