import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

export type InterBranchTransferTransferStatusModel =
    'draft' |
    'sent' |
    'received' |
    'cancelled';

export const interBranchTransferTransferStatusLabelMap: Record<InterBranchTransferTransferStatusModel, string> = {
    'draft': 'Draf',
    'sent': 'Terkirim',
    'received': 'Diterima',
    'cancelled': 'Dibatalkan',
};

export const interBranchTransferTransferStatusOptions: EnumOptionModel<InterBranchTransferTransferStatusModel>[] = [
    { value: 'draft', label: interBranchTransferTransferStatusLabelMap['draft'] },
    { value: 'sent', label: interBranchTransferTransferStatusLabelMap['sent'] },
    { value: 'received', label: interBranchTransferTransferStatusLabelMap['received'] },
    { value: 'cancelled', label: interBranchTransferTransferStatusLabelMap['cancelled'] },
];

export interface InterBranchTransferModel {
    id: number;
    sourceBranchId: number;
    targetBranchId: number;
    transferNumber: string;
    transferDate: string;
    amount: number;
    transferStatus: InterBranchTransferTransferStatusModel;
    description: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
