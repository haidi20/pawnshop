import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { right } from 'fp-ts/Either';

import { unwrapEitherOrThrow } from '@core/util/either';
import {
    PawnContractCustomerGenderEnum,
    PawnContractIdentityTypeEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@feature/pawn_contract/domain/models/pawn-contract-form.model';
import {
    PawnContractIndexTabKeyEnum,
    PawnContractNasabahTabKeyEnum
} from '@feature/pawn_contract/domain/models/pawn-contract-index.model';
import {
    createPawnContractDataModel,
    type PawnContractDataModel
} from '@feature/pawn_contract/domain/models/pawn-contract-data.model';
import type { PawnContractRepository } from '@feature/pawn_contract/domain/repositories/pawn_contract.repository';
import { PawnContractIndexLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_index_local_datasource';
import { GetPawnContractAjtTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_ajt_table.usecase';
import { GetPawnContractIndexTabsUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_index_tabs.usecase';
import { GetPawnContractLocationTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_location_table.usecase';
import { GetPawnContractMaintenanceTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_maintenance_table.usecase';
import { GetPawnContractNasabahTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_nasabah_table.usecase';
import { GetPawnContractRingkasanTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_ringkasan_table.usecase';
import { GetPawnContractSettlementTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_settlement_table.usecase';
import { GetPawnContractSummariesUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_summaries.usecase';
import {
    getPawnContractAvailableActions,
    RUNNING_CONTRACT_STATUSES,
    PAWN_CONTRACT_NASABAH_TABS,
    PAWN_CONTRACT_AJT_OPTIONS,
    PAWN_CONTRACT_SETTLEMENT_OPTIONS,
    PAWN_CONTRACT_LOCATION_OPTIONS,
    PAWN_CONTRACT_INDEX_TABS
} from '@feature/pawn_contract/presentation/view_models/pawn_contract.state';

describe('pawn_contract index usecases', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-03-11T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('builds enriched contract summaries for downstream tables', () => {
        const summaries = unwrapEitherOrThrow(
            new GetPawnContractSummariesUsecase(createRepository()).execute({
                data: createFixtureData(),
                runningContractStatuses: RUNNING_CONTRACT_STATUSES,
                getAvailableActions: getPawnContractAvailableActions
            })
        );
        const todaySummary = summaries.find((item) => item.contract.id === 1);
        const overdueExtendedSummary = summaries.find((item) => item.contract.id === 2);

        expect(summaries).toHaveLength(6);
        expect(todaySummary).toMatchObject({
            customerName: 'Nasabah 1',
            branchName: 'Cabang Utama',
            dueState: 'soon',
            dueLabel: '5 hari lagi',
            itemNames: 'Laptop Pro',
            isOpenContract: true,
            processStatusLabel: 'Data Baru'
        });
        expect(todaySummary?.availableActions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ key: 'edit' }),
                expect.objectContaining({ key: 'history' }),
                expect.objectContaining({ key: 'storage_fee' }),
                expect.objectContaining({ key: 'extension' }),
                expect.objectContaining({ key: 'settlement' })
            ])
        );
        expect(overdueExtendedSummary?.processStatusLabel).toBe('Perpanjangan');
        expect(overdueExtendedSummary?.availableActions).toEqual(
            expect.arrayContaining([expect.objectContaining({ key: 'auction' })])
        );
    });

    test('does not treat draft contracts as open contracts in index summaries', () => {
        const baseData = createFixtureData();
        const dataWithDraft = createPawnContractDataModel({
            ...baseData,
            contracts: [
                ...baseData.contracts,
                {
                    id: 7,
                    contractNumber: 'AKD-007',
                    branchId: 1,
                    customerId: 107,
                    contractDate: '2026-03-10',
                    maturityDate: '2026-04-09',
                    termDays: PawnContractTermDaysEnum.Thirty,
                    appraisedValue: 900000,
                    disbursedValue: 700000,
                    storageFeeAmount: 7000,
                    administrationFeeAmount: 3000,
                    paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
                    amountInWords: null,
                    contractStatus: 'draft',
                    maintenanceRequired: false,
                    maintenanceReport: null,
                    notes: null,
                    createdByUserId: 1,
                    createdAt: '2026-03-10 09:00:00',
                    updatedAt: '2026-03-10 09:00:00'
                }
            ],
            items: [...baseData.items, createItem(7, 7, 'Tablet Draft', 'in_office')],
            customers: [
                ...baseData.customers,
                {
                    id: 107,
                    customerCode: 'CUST-107',
                    fullName: 'Nasabah Draft',
                    gender: PawnContractCustomerGenderEnum.Male,
                    birthDate: '1991-01-01',
                    city: 'Makassar',
                    address: 'Jl. Draft',
                    phoneNumber: '081234567899',
                    identityType: PawnContractIdentityTypeEnum.Ktp,
                    identityNumber: '737100000007'
                }
            ]
        });

        const summaries = unwrapEitherOrThrow(
            new GetPawnContractSummariesUsecase(createRepository()).execute({
                data: dataWithDraft,
                runningContractStatuses: RUNNING_CONTRACT_STATUSES,
                getAvailableActions: getPawnContractAvailableActions
            })
        );
        const draftSummary = summaries.find((item) => item.contract.id === 7);

        expect(draftSummary?.isOpenContract).toBe(false);
        expect(summaries.filter((item) => item.isOpenContract).map((item) => item.contract.id)).not.toContain(7);
    });

    test('builds nasabah table with informative tabs and grouped sections', () => {
        const summaries = getOpenSummaries();
        const usecase = new GetPawnContractNasabahTableUsecase(createRepository());

        const seluruhDataTable = unwrapEitherOrThrow(
            usecase.execute({
                summaries,
                activeTab: PawnContractNasabahTabKeyEnum.AllData,
                nasabahTabs: PAWN_CONTRACT_NASABAH_TABS
            })
        );
        const thirtyDaysTable = unwrapEitherOrThrow(
            usecase.execute({
                summaries,
                activeTab: PawnContractNasabahTabKeyEnum.ThirtyDays,
                nasabahTabs: PAWN_CONTRACT_NASABAH_TABS
            })
        );

        expect(seluruhDataTable.title).toBe('Daftar Kontrak Aktif');
        expect(seluruhDataTable.tabs).toEqual([
            expect.objectContaining({ key: PawnContractNasabahTabKeyEnum.AllData, count: 3 }),
            expect.objectContaining({ key: PawnContractNasabahTabKeyEnum.SevenDays, count: 0 }),
            expect.objectContaining({ key: PawnContractNasabahTabKeyEnum.FifteenDays, count: 0 }),
            expect.objectContaining({ key: PawnContractNasabahTabKeyEnum.ThirtyDays, count: 2 }),
            expect.objectContaining({ key: PawnContractNasabahTabKeyEnum.SixtyDays, count: 1 })
        ]);
        expect(seluruhDataTable.sections.find((item) => item.key === 'bulan_berjalan')?.rows).toHaveLength(1);
        expect(seluruhDataTable.sections.find((item) => item.key === 'satu_bulan_lalu')?.rows).toHaveLength(1);
        expect(seluruhDataTable.sections.find((item) => item.key === 'dua_bulan_lalu')?.rows).toHaveLength(1);
        expect(seluruhDataTable.activeSection.totals.principalAmount).toBe(4100000);
        expect(thirtyDaysTable.displayedSections).toHaveLength(4);
        expect(thirtyDaysTable.displayedSections.find((item) => item.key === 'bulan_berjalan')?.rows).toHaveLength(1);
        expect(thirtyDaysTable.displayedSections.find((item) => item.key === 'satu_bulan_lalu')?.rows).toHaveLength(1);
        expect(thirtyDaysTable.activeSection.rows.map((item) => item.contract.id)).toEqual([1, 6]);
        expect(thirtyDaysTable.activeSection.description).toContain('durasi gadai 30 hari');
    });

    test('builds ringkasan harian table metrics and income rows', () => {
        const table = unwrapEitherOrThrow(
            new GetPawnContractRingkasanTableUsecase(createRepository()).execute({
                summaries: getSummaries()
            })
        );

        expect(table.title).toBe('Aktivitas hari ini');
        expect(table.sections[0].rows.map((item) => item.contract.id)).toEqual([1]);
        expect(table.sections[1].rows.map((item) => item.contract.id)).toEqual([2]);
        expect(table.pendapatanRows).toEqual([
            expect.objectContaining({
                contractId: 1,
                storageFeeAmount: 10000,
                administrationFeeAmount: 5000,
                totalIncome: 15000
            })
        ]);
        expect(table.metrics).toEqual({
            akadBaru: 1000000,
            akadUlang: 2000000,
            totalRealisasi: 3000000,
            pendapatanBtitip: 10000,
            pendapatanBadmin: 5000
        });
    });

    test('builds jatuh tempo table options from open contracts', () => {
        const table = unwrapEitherOrThrow(
            new GetPawnContractAjtTableUsecase(createRepository()).execute({
                summaries: getOpenSummaries(),
                activeType: '30',
                ajtOptions: PAWN_CONTRACT_AJT_OPTIONS
            })
        );

        expect(table.rows.map((item) => item.contract.id)).toEqual([1]);
        expect(table.options.find((item) => item.key === 'tertunggak')?.count).toBe(1);
        expect(table.options.find((item) => item.key === 'tunda_lelang')?.count).toBe(1);
        expect(table.description).toContain('tenor');
    });

    test('builds settlement, location, maintenance, and top-level index tabs', () => {
        const summaries = getSummaries();
        const openSummaries = summaries.filter((item) => item.isOpenContract);
        const repository = createRepository();

        const settlementTable = unwrapEitherOrThrow(
            new GetPawnContractSettlementTableUsecase(repository).execute({
                summaries,
                activeType: 'lelang',
                settlementOptions: PAWN_CONTRACT_SETTLEMENT_OPTIONS
            })
        );
        const locationTable = unwrapEitherOrThrow(
            new GetPawnContractLocationTableUsecase(repository).execute({
                summaries,
                activeTab: 'proses',
                locationOptions: PAWN_CONTRACT_LOCATION_OPTIONS
            })
        );
        const maintenanceTable = unwrapEitherOrThrow(
            new GetPawnContractMaintenanceTableUsecase(repository).execute({
                summaries
            })
        );
        const ringkasanTable = unwrapEitherOrThrow(
            new GetPawnContractRingkasanTableUsecase(repository).execute({
                summaries
            })
        );
        const ajtTable = unwrapEitherOrThrow(
            new GetPawnContractAjtTableUsecase(repository).execute({
                summaries: openSummaries,
                activeType: '30',
                ajtOptions: PAWN_CONTRACT_AJT_OPTIONS
            })
        );
        const indexTabs = unwrapEitherOrThrow(
            new GetPawnContractIndexTabsUsecase(repository).execute({
                openContractCount: openSummaries.length,
                ringkasanRowCount: ringkasanTable.sections.reduce(
                    (total, section) => total + section.rows.length,
                    0
                ),
                ajtRowCount: ajtTable.rows.length,
                redeemedRowCount: settlementTable.rows.length,
                auctionRowCount: settlementTable.rows.length,
                refundRowCount: settlementTable.rows.length,
                locationRowCount: locationTable.rows.length,
                maintenanceRowCount: maintenanceTable.rows.length,
                indexTabs: PAWN_CONTRACT_INDEX_TABS
            })
        );

        expect(settlementTable.rows.map((item) => item.contract.id)).toEqual([4]);
        expect(
            unwrapEitherOrThrow(
                new GetPawnContractSettlementTableUsecase(repository).execute({
                    summaries,
                    activeType: 'lunas',
                    settlementOptions: PAWN_CONTRACT_SETTLEMENT_OPTIONS
                })
            ).rows.map((item) => item.contract.id)
        ).toEqual([3]);
        expect(
            unwrapEitherOrThrow(
                new GetPawnContractSettlementTableUsecase(repository).execute({
                    summaries,
                    activeType: 'refund',
                    settlementOptions: PAWN_CONTRACT_SETTLEMENT_OPTIONS
                })
            ).rows.map((item) => item.contract.id)
        ).toEqual([5]);

        expect(locationTable.rows.map((item) => item.contractId)).toEqual([5, 3, 6, 4]);
        expect(locationTable.rows.find((item) => item.contractId === 6)?.secondaryActionLabel).toBe(
            'Kembalikan ke Kantor'
        );
        expect(locationTable.options.find((item) => item.key === 'kantor')?.count).toBe(1);
        expect(locationTable.options.find((item) => item.key === 'gudang')?.count).toBe(1);

        expect(maintenanceTable.rows).toEqual([
            expect.objectContaining({
                contractId: 6,
                checklistLabel: 'Belum Diperiksa',
                maintenanceRequired: true
            })
        ]);

        expect(indexTabs).toEqual([
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.CustomerContracts, count: 3 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.DailySummary, count: 2 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.DueContracts, count: 1 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.RedeemedContracts, count: 1 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.AuctionContracts, count: 1 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.RefundContracts, count: 1 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.LocationDistribution, count: 4 }),
            expect.objectContaining({ key: PawnContractIndexTabKeyEnum.Maintenance, count: 1 })
        ]);
        expect(indexTabs[0].description).toContain('nasabah aktif');
    });
});

function getSummaries() {
    return unwrapEitherOrThrow(
        new GetPawnContractSummariesUsecase(createRepository()).execute({
            data: createFixtureData(),
            runningContractStatuses: RUNNING_CONTRACT_STATUSES,
            getAvailableActions: getPawnContractAvailableActions
        })
    );
}

function getOpenSummaries() {
    return getSummaries().filter((item) => item.isOpenContract);
}

function createFixtureData(): PawnContractDataModel {
    const today = '2026-03-11';

    return createPawnContractDataModel({
        module: {
            key: 'pawn_contract',
            title: 'Pawn Contract',
            shortTitle: 'Pawn Contract',
            route: '/pawn-contract',
            icon: 'bi bi-file-earmark-text',
            phase: 'phase_1',
            status: 'foundation_ready',
            summary: 'Fixture module',
            goals: [],
            mainTables: [],
            childResources: [],
            entities: [],
            nextSteps: []
        },
        contracts: [
            {
                id: 1,
                contractNumber: 'AKD-001',
                branchId: 1,
                customerId: 101,
                contractDate: today,
                maturityDate: addDays(today, 5),
                termDays: PawnContractTermDaysEnum.Thirty,
                appraisedValue: 1200000,
                disbursedValue: 1000000,
                storageFeeAmount: 10000,
                administrationFeeAmount: 5000,
                paymentOptionDays: PawnContractPaymentOptionDaysEnum.Daily,
                amountInWords: null,
                contractStatus: 'active',
                maintenanceRequired: false,
                maintenanceReport: null,
                notes: null,
                createdByUserId: 1,
                createdAt: `${today} 08:00:00`,
                updatedAt: `${today} 08:00:00`
            },
            {
                id: 2,
                contractNumber: 'AKD-002',
                branchId: 1,
                customerId: 102,
                contractDate: addDays(today, -69),
                maturityDate: addDays(today, -3),
                termDays: PawnContractTermDaysEnum.Sixty,
                appraisedValue: 2300000,
                disbursedValue: 2000000,
                storageFeeAmount: 20000,
                administrationFeeAmount: 10000,
                paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
                amountInWords: null,
                contractStatus: 'extended',
                maintenanceRequired: false,
                maintenanceReport: null,
                notes: null,
                createdByUserId: 1,
                createdAt: `${addDays(today, -69)} 09:00:00`,
                updatedAt: `${today} 10:00:00`
            },
            {
                id: 3,
                contractNumber: 'AKD-003',
                branchId: 2,
                customerId: 103,
                contractDate: addDays(today, -10),
                maturityDate: addDays(today, -1),
                termDays: PawnContractTermDaysEnum.Thirty,
                appraisedValue: 1700000,
                disbursedValue: 1500000,
                storageFeeAmount: 15000,
                administrationFeeAmount: 7000,
                paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
                amountInWords: null,
                contractStatus: 'redeemed',
                maintenanceRequired: false,
                maintenanceReport: null,
                notes: null,
                createdByUserId: 1,
                createdAt: `${addDays(today, -10)} 09:00:00`,
                updatedAt: `${addDays(today, -1)} 15:00:00`
            },
            {
                id: 4,
                contractNumber: 'AKD-004',
                branchId: 2,
                customerId: 104,
                contractDate: addDays(today, -25),
                maturityDate: addDays(today, -10),
                termDays: PawnContractTermDaysEnum.Seven,
                appraisedValue: 950000,
                disbursedValue: 800000,
                storageFeeAmount: 8000,
                administrationFeeAmount: 4000,
                paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
                amountInWords: null,
                contractStatus: 'auctioned',
                maintenanceRequired: false,
                maintenanceReport: null,
                notes: null,
                createdByUserId: 1,
                createdAt: `${addDays(today, -25)} 10:00:00`,
                updatedAt: `${addDays(today, -10)} 11:00:00`
            },
            {
                id: 5,
                contractNumber: 'AKD-005',
                branchId: 1,
                customerId: 105,
                contractDate: addDays(today, -4),
                maturityDate: addDays(today, 26),
                termDays: PawnContractTermDaysEnum.Thirty,
                appraisedValue: 700000,
                disbursedValue: 600000,
                storageFeeAmount: 6000,
                administrationFeeAmount: 3000,
                paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
                amountInWords: null,
                contractStatus: 'cancelled',
                maintenanceRequired: false,
                maintenanceReport: null,
                notes: null,
                createdByUserId: 1,
                createdAt: `${addDays(today, -4)} 12:00:00`,
                updatedAt: `${addDays(today, -3)} 12:00:00`
            },
            {
                id: 6,
                contractNumber: 'AKD-006',
                branchId: 2,
                customerId: 106,
                contractDate: addDays(today, -20),
                maturityDate: addDays(today, 10),
                termDays: PawnContractTermDaysEnum.Thirty,
                appraisedValue: 1300000,
                disbursedValue: 1100000,
                storageFeeAmount: 11000,
                administrationFeeAmount: 5500,
                paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
                amountInWords: null,
                contractStatus: 'active',
                maintenanceRequired: true,
                maintenanceReport: null,
                notes: null,
                createdByUserId: 1,
                createdAt: `${addDays(today, -20)} 13:00:00`,
                updatedAt: `${addDays(today, -2)} 08:00:00`
            }
        ],
        items: [
            createItem(1, 1, 'Laptop Pro', 'in_office'),
            createItem(2, 2, 'Gelang Emas', 'in_warehouse'),
            createItem(3, 3, 'Kamera Mirrorless', 'returned'),
            createItem(4, 4, 'Motor Matic', 'auctioned'),
            createItem(5, 5, 'Tablet Bisnis', 'released'),
            createItem(6, 6, 'MacBook Air', 'other')
        ],
        accessories: [],
        issues: [],
        locationMovements: [],
        branches: [
            {
                id: 1,
                branchCode: 'CBG-01',
                branchName: 'Cabang Utama',
                branchPhoneNumber: '0411-111111',
                availableBalance: 100000000,
                primaryCashAccountId: 1
            },
            {
                id: 2,
                branchCode: 'CBG-02',
                branchName: 'Cabang Timur',
                branchPhoneNumber: '0411-222222',
                availableBalance: 75000000,
                primaryCashAccountId: 2
            }
        ],
        customers: Array.from({ length: 6 }, (_, index) => ({
            id: 101 + index,
            customerCode: `CUST-10${index + 1}`,
            fullName: `Nasabah ${index + 1}`,
            gender: index % 2 === 0 ? PawnContractCustomerGenderEnum.Male : PawnContractCustomerGenderEnum.Female,
            birthDate: '1990-01-01',
            city: 'Makassar',
            address: `Jalan Contoh ${index + 1}`,
            phoneNumber: `08123${index + 1}0000`,
            identityType: PawnContractIdentityTypeEnum.Ktp,
            identityNumber: `7301${index + 1}0000`
        }))
    });
}

function createItem(
    id: number,
    contractId: number,
    itemName: string,
    currentLocationStatus: 'in_office' | 'in_warehouse' | 'returned' | 'auctioned' | 'released' | 'other'
) {
    return {
        id,
        contractId,
        itemSequence: 1,
        itemName,
        categoryId: null,
        itemTypeId: null,
        brandName: 'Brand',
        modelName: 'Model',
        serialNumber: `SER-${id}`,
        itemDescription: itemName,
        quantity: 1,
        appraisedValue: 1000000,
        disbursedValue: 900000,
        conditionNotes: null,
        missingNotes: null,
        specificationJson: null,
        currentLocationId: null,
        currentLocationStatus,
        createdAt: '2026-03-11 08:00:00',
        updatedAt: '2026-03-11 08:00:00'
    };
}

function addDays(value: string, days: number): string {
    const date = new Date(`${value}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

function createRepository(): PawnContractRepository {
    const indexLocalDatasource = new PawnContractIndexLocalDatasource();

    return {
        getData: async (_filters: Parameters<PawnContractRepository['getData']>[0]) => {
            throw new Error('not implemented for unit test');
        },
        getFormReferenceData: async (_params: Parameters<PawnContractRepository['getFormReferenceData']>[0]) => {
            throw new Error('not implemented for unit test');
        },
        getFormValue: async (_params: Parameters<PawnContractRepository['getFormValue']>[0]) => {
            throw new Error('not implemented for unit test');
        },
        saveContract: async (_params: Parameters<PawnContractRepository['saveContract']>[0]) => {
            throw new Error('not implemented for unit test');
        },
        getContractSummaries: (params: Parameters<PawnContractRepository['getContractSummaries']>[0]) => right(indexLocalDatasource.getContractSummaries(params)),
        getNasabahTable: (params: Parameters<PawnContractRepository['getNasabahTable']>[0]) => right(indexLocalDatasource.getNasabahTable(params)),
        getRingkasanTable: (params: Parameters<PawnContractRepository['getRingkasanTable']>[0]) => right(indexLocalDatasource.getRingkasanTable(params)),
        getAjtTable: (params: Parameters<PawnContractRepository['getAjtTable']>[0]) => right(indexLocalDatasource.getAjtTable(params)),
        getSettlementTable: (params: Parameters<PawnContractRepository['getSettlementTable']>[0]) => right(indexLocalDatasource.getSettlementTable(params)),
        getRedeemedTable: (params: Parameters<PawnContractRepository['getRedeemedTable']>[0]) => right(indexLocalDatasource.getRedeemedTable(params)),
        getAuctionTable: (params: Parameters<PawnContractRepository['getAuctionTable']>[0]) => right(indexLocalDatasource.getAuctionTable(params)),
        getRefundTable: (params: Parameters<PawnContractRepository['getRefundTable']>[0]) => right(indexLocalDatasource.getRefundTable(params)),
        getLocationTable: (params: Parameters<PawnContractRepository['getLocationTable']>[0]) => right(indexLocalDatasource.getLocationTable(params)),
        getMaintenanceTable: (params: Parameters<PawnContractRepository['getMaintenanceTable']>[0]) => right(indexLocalDatasource.getMaintenanceTable(params)),
        getIndexTabs: (params: Parameters<PawnContractRepository['getIndexTabs']>[0]) => right(indexLocalDatasource.getIndexTabs(params)),
        getHistorySummaryById: async () => right(null),
        runDefaultSeeder: async () => right(undefined),
        runSingleActiveSeeder: async () => right(undefined)
    } as unknown as PawnContractRepository;
}
