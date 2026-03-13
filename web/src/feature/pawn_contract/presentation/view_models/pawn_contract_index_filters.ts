import type { PawnContractStatusModel } from '@core/util/helpers';
import type { getCurrentAuthPortalBranchAccess } from '@feature/auth_portal/util/auth_portal_session';
import {
    PawnContractIndexTabKeyEnum,
    type PawnContractIndexTabKeyModel,
    type PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';

export interface PawnContractIndexTabFilterModel {
    branchFilter: string;
    statusFilter: 'all' | PawnContractStatusModel;
}

export type PawnContractIndexTabFilterStateModel = Record<
    PawnContractIndexTabKeyModel,
    PawnContractIndexTabFilterModel
>;

const createIndexTabFilter = (branchFilter: string): PawnContractIndexTabFilterModel => ({
    branchFilter,
    statusFilter: 'all'
});

export const createEmptyIndexTabFilters = (): PawnContractIndexTabFilterStateModel =>
    createIndexTabFilters('all');

export const createDefaultIndexTabFilters = (
    branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>
): PawnContractIndexTabFilterStateModel => createIndexTabFilters(resolveDefaultBranchFilter(branchAccess));

export function resolveDefaultBranchFilter(
    branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>
): string {
    return !branchAccess.canAccessAllBranches && branchAccess.assignedBranchId !== null
        ? String(branchAccess.assignedBranchId)
        : 'all';
}

export function hasActiveIndexTabFilters(
    filter: PawnContractIndexTabFilterModel,
    branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>
): boolean {
    return (
        filter.branchFilter !== resolveDefaultBranchFilter(branchAccess) ||
        filter.statusFilter !== 'all'
    );
}

export function filterContractSummariesByTableFilter(
    summaries: PawnContractSummaryModel[],
    filter: PawnContractIndexTabFilterModel,
    branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>
): PawnContractSummaryModel[] {
    const targetBranchId = resolveRequestedBranchId(filter.branchFilter, branchAccess);

    return summaries.filter((summary) => {
        const matchesBranch = targetBranchId === null || summary.contract.branchId === targetBranchId;
        const matchesStatus =
            filter.statusFilter === 'all' || summary.contract.contractStatus === filter.statusFilter;

        return matchesBranch && matchesStatus;
    });
}

function createIndexTabFilters(branchFilter: string): PawnContractIndexTabFilterStateModel {
    return {
        [PawnContractIndexTabKeyEnum.CustomerContracts]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.DailySummary]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.DueContracts]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.SettlementAuction]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.RedeemedContracts]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.AuctionContracts]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.LocationDistribution]: createIndexTabFilter(branchFilter),
        [PawnContractIndexTabKeyEnum.Maintenance]: createIndexTabFilter(branchFilter)
    };
}

function resolveRequestedBranchId(
    branchFilter: string,
    branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>
): number | null {
    if (!branchAccess.canAccessAllBranches) {
        return branchAccess.assignedBranchId;
    }

    return branchFilter !== 'all' && Number.isFinite(Number(branchFilter))
        ? Number(branchFilter)
        : null;
}
