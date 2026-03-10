import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import type { PawnItemLocationStatusModel } from '@core/util/helpers';
import { pawnItemsTable, type PawnItemsRow } from '@feature/pawn_contract/data/db/pawn_items.table';

export class PawnItemsDao extends FeatureTableDao<PawnItemsRow> {
    constructor() {
        super(pawnItemsTable);
    }

    async findByContractIds(contractIds: number[]): Promise<PawnItemsRow[]> {
        if (contractIds.length === 0) {
            return [];
        }

        const contractIdSet = new Set(contractIds);
        const rows = await this.getAll();
        return rows.filter((row) => contractIdSet.has(row.contract_id));
    }

    async findContractIdsByLocationStatus(status: PawnItemLocationStatusModel): Promise<number[]> {
        const rows = await this.getAll();
        return Array.from(
            new Set(
                rows
                    .filter((row) => row.current_location_status === status)
                    .map((row) => row.contract_id)
            )
        );
    }
}

export const pawnItemsDao = new PawnItemsDao();
