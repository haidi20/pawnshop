import type { AuthPortalUsersRow } from '@feature/auth_portal/data/db';
import type { BranchesRow } from '@feature/master_branch/data/db';

export const getDelegatedBranchIds = (
    userRows: AuthPortalUsersRow[],
    companyId: number
): Set<number> =>
    new Set(
        userRows
            .filter(
                (item) =>
                    item.company_id === companyId &&
                    item.role !== 'owner' &&
                    item.is_active === 1 &&
                    typeof item.assigned_branch_id === 'number'
            )
            .map((item) => item.assigned_branch_id)
            .filter((branchId): branchId is number => typeof branchId === 'number')
    );

export const syncDelegatedBranches = (params: {
    branchRows: BranchesRow[];
    delegatedBranchIds: Set<number>;
    timestamp: string;
}): { rows: BranchesRow[]; hasChanges: boolean } => {
    let hasChanges = false;

    const rows = params.branchRows.map((row) => {
        const nextIsActive = params.delegatedBranchIds.has(row.id) ? 1 : 0;
        if (row.is_active === nextIsActive) {
            return row;
        }

        hasChanges = true;

        return {
            ...row,
            is_active: nextIsActive,
            updated_at: params.timestamp
        };
    });

    return {
        rows,
        hasChanges
    };
};
