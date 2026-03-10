export interface PawnItemAccessoryModel {
    id: number;
    pawnItemId: number;
    accessoryName: string;
    accessoryCondition: string | null;
    notes: string | null;
    sortOrder: number;
    createdAt: string | null;
    updatedAt: string | null;
}
