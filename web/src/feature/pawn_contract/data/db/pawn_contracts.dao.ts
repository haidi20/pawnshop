import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { pawnContractsTable, type PawnContractsRow } from '@feature/pawn_contract/data/db/pawn_contracts.table';

export class PawnContractsDao extends FeatureTableDao<PawnContractsRow> {
    constructor() {
        super(pawnContractsTable);
    }
}

export const pawnContractsDao = new PawnContractsDao();
