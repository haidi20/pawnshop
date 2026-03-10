import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemIssuesTable, type PawnItemIssuesRow } from '@feature/pawn_contract/data/db/pawn_item_issues.table';

export class PawnItemIssuesDao extends FeatureTableDao<PawnItemIssuesRow> {
    constructor() {
        super(pawnItemIssuesTable);
    }

    async findByPawnItemIds(pawnItemIds: number[]): Promise<PawnItemIssuesRow[]> {
        if (pawnItemIds.length === 0) {
            return [];
        }

        const pawnItemIdSet = new Set(pawnItemIds);
        const rows = await this.getAll();
        return rows.filter((row) => pawnItemIdSet.has(row.pawn_item_id));
    }
}

export const pawnItemIssuesDao = new PawnItemIssuesDao();
