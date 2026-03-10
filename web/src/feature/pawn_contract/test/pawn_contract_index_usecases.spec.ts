import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
    PawnContractCustomerGenderEnum,
    PawnContractIdentityTypeEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '../domain/models/pawn-contract-form.model';
import {
    createPawnContractDataModel,
    type PawnContractDataModel
} from '../domain/models/pawn-contract-data.model';
import type { PawnContractRepository } from '../domain/repositories/pawn_contract.repository';
import { PawnContractIndexLocalDatasource } from '../data/datasources/pawn_contract_index_local_datasource';
import { GetPawnContractAjtTableUsecase } from '../domain/usecases/get_pawn_contract_ajt_table.usecase';
import { GetPawnContractIndexTabsUsecase } from '../domain/usecases/get_pawn_contract_index_tabs.usecase';
import { GetPawnContractLocationTableUsecase } from '../domain/usecases/get_pawn_contract_location_table.usecase';
import { GetPawnContractMaintenanceTableUsecase } from '../domain/usecases/get_pawn_contract_maintenance_table.usecase';
import { GetPawnContractNasabahTableUsecase } from '../domain/usecases/get_pawn_contract_nasabah_table.usecase';
import { GetPawnContractRingkasanTableUsecase } from '../domain/usecases/get_pawn_contract_ringkasan_table.usecase';
import { GetPawnContractSettlementTableUsecase } from '../domain/usecases/get_pawn_contract_settlement_table.usecase';
import { GetPawnContractSummariesUsecase } from '../domain/usecases/get_pawn_contract_summaries.usecase';

describe('pawn_contract index usecases', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-03-11T00:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('builds enriched contract summaries for downstream tables', () => {
        const summaries = new GetPawnContractSummariesUsecase(createRepository()).execute(createFixtureData());
        const todaySummary = summaries.find((item) => item.contract.id === 1);
        const overdueExtendedSummary = summaries.find((item) => item.contract.id === 2);

        expect(summaries).toHaveLength(6);
        expect(todaySummary).toMatchObject({
            customerName: 'Nasabah 1',
            branchName: 'Cabang Utama',
            dueState: 'soon',
            dueLabel: '5 hari lagi',
            itemNames: 'Laptop Pro',
            isOpenContract: true
        });
        expect(todaySummary?.procedureTags).toEqual(
            expect.arrayContaining(['Bayar B. Titip', 'Pelunasan', 'Akad Ulang', 'Perpanjangan'])
        );
        expect(overdueExtendedSummary?.procedureTags).toContain('Lelang');
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

        const summaries = new GetPawnContractSummariesUsecase(createRepository()).execute(dataWithDraft);
        const draftSummary = summaries.find((item) => item.contract.id === 7);

        expect(draftSummary?.isOpenContract).toBe(false);
        expect(summaries.filter((item) => item.isOpenContract).map((item) => item.contract.id)).not.toContain(7);
    });

    test('builds nasabah table with informative tabs and grouped sections', () => {
        const summaries = getOpenSummaries();
        const usecase = new GetPawnContractNasabahTableUsecase(createRepository());

        const seluruhDataTable = usecase.execute({
            summaries,
            activeTab: 'seluruh_data'
        });
        const harianTable = usecase.execute({
            summaries,
            activeTab: 'harian'
        });

        expect(seluruhDataTable.title).toBe('Daftar akad aktif');
        expect(seluruhDataTable.tabs).toEqual([
            expect.objectContaining({ key: 'seluruh_data', count: 3 }),
            expect.objectContaining({ key: 'harian', count: 1 }),
            expect.objectContaining({ key: 'tujuh_hari', count: 1 }),
            expect.objectContaining({ key: 'lima_belas_hari', count: 1 })
        ]);
        expect(seluruhDataTable.sections.find((item) => item.key === 'bulan_berjalan')?.rows).toHaveLength(1);
        expect(seluruhDataTable.sections.find((item) => item.key === 'satu_bulan_lalu')?.rows).toHaveLength(1);
        expect(seluruhDataTable.sections.find((item) => item.key === 'dua_bulan_lalu')?.rows).toHaveLength(1);
        expect(seluruhDataTable.activeSection.totals.principalAmount).toBe(4100000);
        expect(harianTable.displayedSections).toHaveLength(1);
        expect(harianTable.activeSection.rows.map((item) => item.contract.id)).toEqual([1]);
        expect(harianTable.activeSection.description).toContain('pembayaran harian');
    });

    test('builds ringkasan harian table metrics and income rows', () => {
        const table = new GetPawnContractRingkasanTableUsecase(createRepository()).execute({
            summaries: getSummaries()
        });

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
        const table = new GetPawnContractAjtTableUsecase(createRepository()).execute({
            summaries: getOpenSummaries(),
            activeType: '30'
        });

        expect(table.rows.map((item) => item.contract.id)).toEqual([1]);
        expect(table.options.find((item) => item.key === 'tertunggak')?.count).toBe(1);
        expect(table.options.find((item) => item.key === 'tunda_lelang')?.count).toBe(1);
        expect(table.description).toContain('tenor');
    });

    test('builds settlement, location, maintenance, and top-level index tabs', () => {
        const summaries = getSummaries();
        const openSummaries = summaries.filter((item) => item.isOpenContract);
        const repository = createRepository();

        const settlementTable = new GetPawnContractSettlementTableUsecase(repository).execute({
            summaries,
            activeType: 'lelang'
        });
        const locationTable = new GetPawnContractLocationTableUsecase(repository).execute({
            summaries,
            activeTab: 'proses'
        });
        const maintenanceTable = new GetPawnContractMaintenanceTableUsecase(repository).execute({
            summaries
        });
        const ringkasanTable = new GetPawnContractRingkasanTableUsecase(repository).execute({
            summaries
        });
        const ajtTable = new GetPawnContractAjtTableUsecase(repository).execute({
            summaries: openSummaries,
            activeType: '30'
        });
        const indexTabs = new GetPawnContractIndexTabsUsecase(repository).execute({
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

        expect(settlementTable.rows.map((item) => item.contract.id)).toEqual([4]);
        expect(
            new GetPawnContractSettlementTableUsecase(repository).execute({
                summaries,
                activeType: 'lunas'
            }).rows.map((item) => item.contract.id)
        ).toEqual([3]);
        expect(
            new GetPawnContractSettlementTableUsecase(repository).execute({
                summaries,
                activeType: 'refund'
            }).rows.map((item) => item.contract.id)
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
            expect.objectContaining({ key: 'nasabah_akad', count: 3 }),
            expect.objectContaining({ key: 'ringkasan_harian', count: 2 }),
            expect.objectContaining({ key: 'akad_jatuh_tempo', count: 1 }),
            expect.objectContaining({ key: 'pelunasan_lelang', count: 1 }),
            expect.objectContaining({ key: 'lokasi_distribusi', count: 4 }),
            expect.objectContaining({ key: 'maintenance', count: 1 })
        ]);
        expect(indexTabs[0].description).toContain('nasabah aktif');
    });
});

function getSummaries() {
    return new GetPawnContractSummariesUsecase(createRepository()).execute(createFixtureData());
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
        getData: async (_filters) => {
            throw new Error('not implemented for unit test');
        },
        getFormReferenceData: async () => {
            throw new Error('not implemented for unit test');
        },
        getFormValue: async (_contractId) => {
            throw new Error('not implemented for unit test');
        },
        saveContract: async (_payload) => {
            throw new Error('not implemented for unit test');
        },
        getContractSummaries: (data) => indexLocalDatasource.getContractSummaries(data),
        getNasabahTable: (params) => indexLocalDatasource.getNasabahTable(params),
        getRingkasanTable: (params) => indexLocalDatasource.getRingkasanTable(params),
        getAjtTable: (params) => indexLocalDatasource.getAjtTable(params),
        getSettlementTable: (params) => indexLocalDatasource.getSettlementTable(params),
        getLocationTable: (params) => indexLocalDatasource.getLocationTable(params),
        getMaintenanceTable: (params) => indexLocalDatasource.getMaintenanceTable(params),
        getIndexTabs: (params) => indexLocalDatasource.getIndexTabs(params)
    };
}
