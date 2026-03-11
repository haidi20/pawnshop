import { describe, expect, test } from 'vitest';

import type { PawnContractStatusModel } from '@core/util/helpers';
import {
    PawnContractIndexTabKeyEnum,
    type PawnContractSummaryModel
} from '@feature/pawn_contract/domain/models';
import {
    createDefaultIndexTabFilters,
    filterContractSummariesByTableFilter,
    hasActiveIndexTabFilters
} from '@feature/pawn_contract/presentation/view_models/pawn_contract_index_filters';

describe('pawn contract index tab filters', () => {
    test('creates the default branch filter for every tab based on branch access', () => {
        const filters = createDefaultIndexTabFilters({
            canAccessAllBranches: false,
            assignedBranchId: 17,
            assignedBranchName: 'Cabang 17'
        });

        expect(filters[PawnContractIndexTabKeyEnum.CustomerContracts]).toEqual({
            branchFilter: '17',
            statusFilter: 'all'
        });
        expect(filters[PawnContractIndexTabKeyEnum.DailySummary]).toEqual({
            branchFilter: '17',
            statusFilter: 'all'
        });
        expect(filters[PawnContractIndexTabKeyEnum.Maintenance]).toEqual({
            branchFilter: '17',
            statusFilter: 'all'
        });
    });

    test('keeps each tab filter scoped to the tab that owns it', () => {
        const summaries = [
            createSummary(1, 1, 'active'),
            createSummary(2, 2, 'extended'),
            createSummary(3, 1, 'redeemed')
        ];
        const filters = createDefaultIndexTabFilters({
            canAccessAllBranches: true,
            assignedBranchId: null,
            assignedBranchName: null
        });

        filters[PawnContractIndexTabKeyEnum.CustomerContracts] = {
            branchFilter: '1',
            statusFilter: 'active'
        };

        const nasabahRows = filterContractSummariesByTableFilter(
            summaries,
            filters[PawnContractIndexTabKeyEnum.CustomerContracts],
            {
                canAccessAllBranches: true,
                assignedBranchId: null,
                assignedBranchName: null
            }
        );
        const ringkasanRows = filterContractSummariesByTableFilter(
            summaries,
            filters[PawnContractIndexTabKeyEnum.DailySummary],
            {
                canAccessAllBranches: true,
                assignedBranchId: null,
                assignedBranchName: null
            }
        );

        expect(nasabahRows.map((item) => item.contract.id)).toEqual([1]);
        expect(ringkasanRows.map((item) => item.contract.id)).toEqual([1, 2, 3]);
        expect(
            hasActiveIndexTabFilters(filters[PawnContractIndexTabKeyEnum.CustomerContracts], {
                canAccessAllBranches: true,
                assignedBranchId: null,
                assignedBranchName: null
            })
        ).toBe(true);
        expect(
            hasActiveIndexTabFilters(filters[PawnContractIndexTabKeyEnum.DailySummary], {
                canAccessAllBranches: true,
                assignedBranchId: null,
                assignedBranchName: null
            })
        ).toBe(false);
    });

    test('keeps non-owner filters locked to the assigned branch', () => {
        const summaries = [
            createSummary(1, 1, 'active'),
            createSummary(2, 2, 'active')
        ];

        const filteredRows = filterContractSummariesByTableFilter(
            summaries,
            {
                branchFilter: '2',
                statusFilter: 'all'
            },
            {
                canAccessAllBranches: false,
                assignedBranchId: 1,
                assignedBranchName: 'Cabang 1'
            }
        );

        expect(filteredRows.map((item) => item.contract.id)).toEqual([1]);
    });
});

function createSummary(
    id: number,
    branchId: number,
    contractStatus: PawnContractStatusModel
): PawnContractSummaryModel {
    return {
        contract: {
            id,
            contractNumber: `G-${id}`,
            branchId,
            customerId: id,
            contractDate: '2026-03-01',
            maturityDate: '2026-04-01',
            termDays: 30,
            appraisedValue: 1_000_000,
            disbursedValue: 800_000,
            storageFeeAmount: 25_000,
            administrationFeeAmount: 10_000,
            paymentOptionDays: null,
            amountInWords: null,
            contractStatus,
            maintenanceRequired: false,
            maintenanceReport: null,
            notes: null,
            createdByUserId: null,
            createdAt: null,
            updatedAt: null
        }
    } as PawnContractSummaryModel;
}
