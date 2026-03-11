import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { pawnContractStatusOptions } from '@core/util/helpers';
import { PawnContractIndexLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_index_local_datasource';
import { createPawnContractDataFromRows } from '@feature/pawn_contract/data/mappers/pawn_contract.mapper';
import {
    PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT,
    createPawnContractDemoSeedDataset
} from '@feature/pawn_contract/data/seeders/pawn_contract_demo_data.seeder';
import { PawnContractNasabahTabKeyEnum } from '@feature/pawn_contract/domain/models';

describe('pawn contract demo data seeder', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-03-11T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('builds 500 demo contracts and covers all pawn contract index views', () => {
        const dataset = createPawnContractDemoSeedDataset('2026-03-11');
        const data = createPawnContractDataFromRows({
            module: getAppModuleByKey('pawn-contract'),
            contractRows: dataset.contracts,
            itemRows: dataset.items,
            accessoryRows: dataset.accessories,
            issueRows: dataset.issues,
            locationMovementRows: dataset.locationMovements,
            branches: dataset.branches.map((branchRow) => {
                const cashAccount =
                    dataset.branchCashAccounts.find(
                        (row) => row.branch_id === branchRow.id && row.is_active === 1
                    ) ?? null;

                return {
                    id: branchRow.id,
                    branchCode: branchRow.branch_code,
                    branchName: branchRow.branch_name,
                    branchPhoneNumber: branchRow.phone_number,
                    availableBalance: cashAccount?.current_balance ?? 0,
                    primaryCashAccountId: cashAccount?.id ?? null
                };
            }),
            customers: dataset.customers.map((customerRow) => {
                const phoneContact =
                    dataset.customerContacts.find(
                        (row) => row.customer_id === customerRow.id && row.contact_type === 'phone'
                    ) ?? null;
                const primaryDocument =
                    dataset.customerDocuments.find(
                        (row) => row.customer_id === customerRow.id && row.is_primary === 1
                    ) ?? null;

                return {
                    id: customerRow.id,
                    customerCode: customerRow.customer_code,
                    fullName: customerRow.full_name,
                    gender: customerRow.gender,
                    birthDate: customerRow.birth_date ?? '2000-01-01',
                    city: customerRow.city ?? '',
                    address: customerRow.address ?? '',
                    phoneNumber: phoneContact?.contact_value ?? '',
                    identityType: primaryDocument?.document_type ?? null,
                    identityNumber: primaryDocument?.document_number ?? null
                };
            })
        });
        const datasource = new PawnContractIndexLocalDatasource();
        const summaries = datasource.getContractSummaries(data);
        const openSummaries = summaries.filter((item) => item.isOpenContract);
        const ringkasanTable = datasource.getRingkasanTable({ summaries });
        const ajtTable = datasource.getAjtTable({ summaries: openSummaries, activeType: '30' });
        const settlementTable = datasource.getSettlementTable({ summaries, activeType: 'lunas' });
        const locationTable = datasource.getLocationTable({ summaries, activeTab: 'kantor' });
        const maintenanceTable = datasource.getMaintenanceTable({ summaries });
        const nasabahTable = datasource.getNasabahTable({
            summaries: openSummaries,
            activeTab: PawnContractNasabahTabKeyEnum.AllData
        });
        const indexTabs = datasource.getIndexTabs({
            openContractCount: openSummaries.length,
            ringkasanRowCount: ringkasanTable.sections.reduce(
                (total, section) => total + section.rows.length,
                0
            ),
            ajtRowCount: ajtTable.rows.length,
            settlementRowCount: settlementTable.rows.length,
            locationRowCount: locationTable.rows.length,
            maintenanceRowCount: maintenanceTable.rows.length
        });

        expect(dataset.contracts).toHaveLength(PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT);
        expect(dataset.customers).toHaveLength(PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT);
        expect(dataset.customerContacts).toHaveLength(PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT);
        expect(dataset.customerDocuments).toHaveLength(PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT);
        expect(dataset.items.length).toBeGreaterThan(PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT);

        expect(indexTabs.every((tab) => tab.count > 0)).toBe(true);
        expect(nasabahTable.tabs.every((tab) => tab.count > 0)).toBe(true);
        expect(nasabahTable.sections.every((section) => section.rows.length > 0)).toBe(true);
        expect(ringkasanTable.sections.every((section) => section.rows.length > 0)).toBe(true);
        expect(ringkasanTable.pendapatanRows.length).toBeGreaterThan(0);
        expect(ajtTable.options.every((option) => option.count > 0)).toBe(true);
        expect(settlementTable.options.every((option) => option.count > 0)).toBe(true);
        expect(locationTable.options.every((option) => option.count > 0)).toBe(true);
        expect(maintenanceTable.rows.length).toBeGreaterThan(0);

        expect(
            pawnContractStatusOptions.every(({ value }) =>
                dataset.contracts.some((contract) => contract.contract_status === value)
            )
        ).toBe(true);
        expect(
            dataset.branches.every((branch) =>
                dataset.contracts.some((contract) => contract.branch_id === branch.id)
            )
        ).toBe(true);
    });
});
