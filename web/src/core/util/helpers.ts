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

export type PawnItemLocationStatusModel =
    | 'in_office'
    | 'in_warehouse'
    | 'released'
    | 'auctioned'
    | 'returned'
    | 'other';

export const pawnItemLocationStatusLabelMap: Record<PawnItemLocationStatusModel, string> = {
    in_office: 'Di kantor',
    in_warehouse: 'Di gudang',
    released: 'Dikeluarkan',
    auctioned: 'Dilelang',
    returned: 'Dikembalikan',
    other: 'Lainnya'
};

export const pawnItemLocationStatusOptions: EnumOptionModel<PawnItemLocationStatusModel>[] = [
    { value: 'in_office', label: pawnItemLocationStatusLabelMap.in_office },
    { value: 'in_warehouse', label: pawnItemLocationStatusLabelMap.in_warehouse },
    { value: 'released', label: pawnItemLocationStatusLabelMap.released },
    { value: 'auctioned', label: pawnItemLocationStatusLabelMap.auctioned },
    { value: 'returned', label: pawnItemLocationStatusLabelMap.returned },
    { value: 'other', label: pawnItemLocationStatusLabelMap.other }
];
