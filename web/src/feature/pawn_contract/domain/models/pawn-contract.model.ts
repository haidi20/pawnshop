import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

export type PawnContractStatusModel =
    | 'draft'
    | 'active'
    | 'extended'
    | 'redeemed'
    | 'auctioned'
    | 'closed'
    | 'cancelled';

export const pawnContractStatusLabelMap: Record<PawnContractStatusModel, string> = {
    draft: 'Draf',
    active: 'Aktif',
    extended: 'Diperpanjang',
    redeemed: 'Ditebus',
    auctioned: 'Dilelang',
    closed: 'Ditutup',
    cancelled: 'Dibatalkan'
};

export const pawnContractStatusOptions: EnumOptionModel<PawnContractStatusModel>[] = [
    { value: 'draft', label: pawnContractStatusLabelMap.draft },
    { value: 'active', label: pawnContractStatusLabelMap.active },
    { value: 'extended', label: pawnContractStatusLabelMap.extended },
    { value: 'redeemed', label: pawnContractStatusLabelMap.redeemed },
    { value: 'auctioned', label: pawnContractStatusLabelMap.auctioned },
    { value: 'closed', label: pawnContractStatusLabelMap.closed },
    { value: 'cancelled', label: pawnContractStatusLabelMap.cancelled }
];

export interface PawnContractModel {
    id: number;
    contractNumber: string;
    branchId: number;
    customerId: number;
    contractDate: string;
    maturityDate: string;
    termDays: number;
    appraisedValue: number;
    disbursedValue: number;
    storageFeeAmount: number;
    administrationFeeAmount: number;
    paymentOptionDays: number | null;
    amountInWords: string | null;
    contractStatus: PawnContractStatusModel;
    maintenanceRequired: boolean;
    maintenanceReport: string | null;
    notes: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
