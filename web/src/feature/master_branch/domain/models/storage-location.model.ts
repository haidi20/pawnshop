export interface StorageLocationModel {
    id: number;
    branchId: number | null;
    locationCode: string;
    locationName: string;
    locationType: string;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
