import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnItemIssuesTable, type PawnItemIssuesRow } from '@feature/pawn_contract/data/db/pawn_item_issues.table';

export class PawnItemIssuesDao extends FeatureTableDao<PawnItemIssuesRow> {
    constructor() {
        super(pawnItemIssuesTable);
    }
}

export const pawnItemIssuesDao = new PawnItemIssuesDao();
