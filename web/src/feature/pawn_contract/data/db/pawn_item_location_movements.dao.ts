import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemLocationMovementsTable, type PawnItemLocationMovementsRow } from '@feature/pawn_contract/data/db/pawn_item_location_movements.table';

export class PawnItemLocationMovementsDao extends FeatureTableDao<PawnItemLocationMovementsRow> {
    constructor() {
        super(pawnItemLocationMovementsTable);
    }

    async findByPawnItemIds(pawnItemIds: number[]): Promise<PawnItemLocationMovementsRow[]> {
        if (pawnItemIds.length === 0) {
            return [];
        }

        const pawnItemIdSet = new Set(pawnItemIds);
        const rows = await this.getAll();
        return rows.filter((row) => pawnItemIdSet.has(row.pawn_item_id));
    }
}

export const pawnItemLocationMovementsDao = new PawnItemLocationMovementsDao();
