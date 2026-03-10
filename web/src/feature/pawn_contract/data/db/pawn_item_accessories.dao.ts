import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemAccessoriesTable, type PawnItemAccessoriesRow } from '@feature/pawn_contract/data/db/pawn_item_accessories.table';

export class PawnItemAccessoriesDao extends FeatureTableDao<PawnItemAccessoriesRow> {
    constructor() {
        super(pawnItemAccessoriesTable);
    }
}

export const pawnItemAccessoriesDao = new PawnItemAccessoriesDao();
