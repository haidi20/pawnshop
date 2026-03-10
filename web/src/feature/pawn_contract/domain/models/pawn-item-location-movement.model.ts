import type { PawnItemLocationStatusModel } from '@core/util/helpers';

export interface PawnItemLocationMovementModel {
    id: number;
    pawnItemId: number;
    fromLocationId: number | null;
    toLocationId: number | null;
    fromStatus: PawnItemLocationStatusModel | null;
    toStatus: PawnItemLocationStatusModel | null;
    movedAt: string;
    movedByUserId: number | null;
    notes: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
