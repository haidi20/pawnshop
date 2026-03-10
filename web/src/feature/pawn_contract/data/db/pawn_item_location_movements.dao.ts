import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemLocationMovementsTable, type PawnItemLocationMovementsRow } from '@feature/pawn_contract/data/db/pawn_item_location_movements.table';

export class PawnItemLocationMovementsDao extends FeatureTableDao<PawnItemLocationMovementsRow> {
    constructor() {
        super(pawnItemLocationMovementsTable);
    }
}

export const pawnItemLocationMovementsDao = new PawnItemLocationMovementsDao();
