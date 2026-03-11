export interface MasterLocationUpsertPayloadModel {
    id?: number;
    branchId: number;
    locationCode: string;
    locationName: string;
    locationType: string;
    isActive: boolean;
}
