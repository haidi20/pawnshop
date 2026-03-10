import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemAccessoriesTable, type PawnItemAccessoriesRow } from '@feature/pawn_contract/data/db/pawn_item_accessories.table';

export class PawnItemAccessoriesDao extends FeatureTableDao<PawnItemAccessoriesRow> {
    constructor() {
        super(pawnItemAccessoriesTable);
    }

    async findByPawnItemIds(pawnItemIds: number[]): Promise<PawnItemAccessoriesRow[]> {
        if (pawnItemIds.length === 0) {
            return [];
        }

        const pawnItemIdSet = new Set(pawnItemIds);
        const rows = await this.getAll();
        return rows.filter((row) => pawnItemIdSet.has(row.pawn_item_id));
    }
}

export const pawnItemAccessoriesDao = new PawnItemAccessoriesDao();
