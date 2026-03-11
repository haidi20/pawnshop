import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { getTodayDateValue } from '@core/util/pawn-contract-form';
import type { PawnContractStatusModel } from '@core/util/helpers';
import { pawnContractsTable, type PawnContractsRow } from '@feature/pawn_contract/data/db/pawn_contracts.table';

export interface PawnContractDaoFilterParams {
    branchId?: number | null;
    contractStatus?: PawnContractStatusModel | null;
    onlyOpenContracts?: boolean;
    dueWithinDays?: number | null;
    maintenanceRequired?: boolean;
    contractIds?: number[] | null;
}

const ACTIVE_CONTRACT_STATUSES = new Set<PawnContractStatusModel>(['active', 'extended']);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getDaysToMaturity = (value: string): number => {
    const today = new Date(`${getTodayDateValue()}T00:00:00`);
    const maturityDate = new Date(`${value}T00:00:00`);
    return Math.floor((maturityDate.getTime() - today.getTime()) / DAY_IN_MS);
};

export class PawnContractsDao extends FeatureTableDao<PawnContractsRow> {
    constructor() {
        super(pawnContractsTable);
    }

    async findById(contractId: number): Promise<PawnContractsRow | null> {
        const rows = await this.getAll();
        return rows.find((row) => row.id === contractId) ?? null;
    }

    async findByFilters(filters: PawnContractDaoFilterParams = {}): Promise<PawnContractsRow[]> {
        let rows = await this.getAll();

        if (typeof filters.branchId === 'number') {
            rows = rows.filter((row) => row.branch_id === filters.branchId);
        }

        if (filters.contractStatus) {
            rows = rows.filter((row) => row.contract_status === filters.contractStatus);
        }

        if (filters.onlyOpenContracts) {
            rows = rows.filter((row) => ACTIVE_CONTRACT_STATUSES.has(row.contract_status));
        }

        if (filters.maintenanceRequired) {
            rows = rows.filter((row) => row.maintenance_required === 1);
        }

        if (typeof filters.dueWithinDays === 'number') {
            rows = rows.filter((row) => {
                const daysToMaturity = getDaysToMaturity(row.maturity_date);
                return daysToMaturity >= 0 && daysToMaturity <= filters.dueWithinDays!;
            });
        }

        if (filters.contractIds) {
            if (filters.contractIds.length === 0) {
                return [];
            }

            const contractIdSet = new Set(filters.contractIds);
            rows = rows.filter((row) => contractIdSet.has(row.id));
        }

        return rows.sort((left, right) => {
            return new Date(`${right.contract_date}T00:00:00`).getTime() -
                new Date(`${left.contract_date}T00:00:00`).getTime();
        });
    }
}

export const pawnContractsDao = new PawnContractsDao();
