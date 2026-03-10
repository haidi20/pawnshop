import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemsTable, type PawnItemsRow } from '@feature/pawn_contract/data/db/pawn_items.table';

export class PawnItemsDao extends FeatureTableDao<PawnItemsRow> {
    constructor() {
        super(pawnItemsTable);
    }
}

export const pawnItemsDao = new PawnItemsDao();
