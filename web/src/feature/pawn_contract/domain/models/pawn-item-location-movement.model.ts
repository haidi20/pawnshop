export interface PawnItemLocationMovementModel {
    id: number;
    pawnItemId: number;
    fromLocationId: number | null;
    toLocationId: number | null;
    fromStatus: string | null;
    toStatus: string | null;
    movedAt: string;
    movedByUserId: number | null;
    notes: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
