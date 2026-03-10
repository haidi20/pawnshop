import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

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

export interface PawnItemModel {
    id: number;
    contractId: number;
    itemSequence: number;
    itemName: string;
    categoryId: number | null;
    itemTypeId: number | null;
    brandName: string | null;
    modelName: string | null;
    serialNumber: string | null;
    itemDescription: string | null;
    quantity: number;
    appraisedValue: number;
    disbursedValue: number;
    conditionNotes: string | null;
    missingNotes: string | null;
    specificationJson: Record<string, unknown> | null;
    currentLocationId: number | null;
    currentLocationStatus: PawnItemLocationStatusModel;
    createdAt: string | null;
    updatedAt: string | null;
}
