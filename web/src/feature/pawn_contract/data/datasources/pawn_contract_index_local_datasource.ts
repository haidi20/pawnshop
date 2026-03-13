import {
    buildPawnContractIdentityLabel,
    buildPawnContractLocationLabel,
    getMonthOffsetFromToday,
    getPawnContractDaysToDate,
    getPawnContractDueLabel,
    getPawnContractDueState,
    getPawnContractEstimatedArrears,
    getPawnItemLocationStatusLabel,
    isSameDateValue,
    sortDateOnlyDesc,
    type PawnContractStatusModel
} from '@core/util/helpers';
import { getTodayDateValue } from '@core/util/pawn-contract-form';
import {
    PawnContractIndexTabKeyEnum,
    PawnContractNasabahTabKeyEnum
} from '@feature/pawn_contract/domain/models';

import type {
    PawnContractActionKeyModel,
    PawnContractActionOptionModel,
    GetPawnContractAjtTableParamsModel,
    GetPawnContractIndexTabsParamsModel,
    GetPawnContractLocationTableParamsModel,
    GetPawnContractMaintenanceTableParamsModel,
    GetPawnContractNasabahTableParamsModel,
    GetPawnContractRingkasanTableParamsModel,
    GetPawnContractSettlementTableParamsModel,
    PawnContractAjtTableModel,
    PawnContractAjtTypeModel,
    PawnContractDataModel,
    PawnContractIndexTabModel,
    PawnContractLocationRowModel,
    PawnContractLocationTableModel,
    PawnContractLocationTabModel,
    PawnContractMaintenanceRowModel,
    PawnContractMaintenanceTableModel,
    PawnContractNasabahSectionModel,
    PawnContractNasabahTabKeyModel,
    PawnContractNasabahTableModel,
    PawnContractRingkasanTableModel,
    PawnContractSettlementTableModel,
    PawnContractSettlementTypeModel,
    PawnContractSummaryModel,
    PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';



export class PawnContractIndexLocalDatasource {
    getContractSummaries(params: {
        data: PawnContractDataModel | null;
        runningContractStatuses: Set<PawnContractStatusModel>;
        getAvailableActions: (params: { contractStatus: string; daysToMaturity: number }) => PawnContractActionOptionModel[];
    }): PawnContractSummaryModel[] {
        const { data, runningContractStatuses, getAvailableActions } = params;

        if (!data) {
            return [];
        }

        return [...data.contractDetails]
            .map((detail) => {
                const customer = data.customers.find((item) => item.id === detail.contract.customerId) ?? null;
                const branch = data.branches.find((item) => item.id === detail.contract.branchId) ?? null;
                const itemNames = detail.items.map(({ item }) => item.itemName).join(', ') || 'Belum ada barang';
                const locationStatuses = Array.from(new Set(detail.items.map(({ item }) => item.currentLocationStatus)));
                const daysToMaturity = getPawnContractDaysToDate(detail.contract.maturityDate);
                const isOpenContract = runningContractStatuses.has(detail.contract.contractStatus);

                return {
                    ...detail,
                    customerName: customer?.fullName ?? `Nasabah #${detail.contract.customerId}`,
                    customerPhone: customer?.phoneNumber || '-',
                    customerIdentity: buildPawnContractIdentityLabel(
                        customer?.identityType ?? null,
                        customer?.identityNumber ?? null
                    ),
                    branchName: branch?.branchName ?? `Cabang #${detail.contract.branchId}`,
                    itemNames,
                    locationLabel: buildPawnContractLocationLabel(locationStatuses),
                    daysToMaturity,
                    dueState: getPawnContractDueState(daysToMaturity),
                    dueLabel: getPawnContractDueLabel(daysToMaturity),
                    hasWarehouseItem: detail.items.some(({ item }) => item.currentLocationStatus === 'in_warehouse'),
                    isOpenContract,
                    arrears: getPawnContractEstimatedArrears({
                        maturityDate: detail.contract.maturityDate,
                        paymentOptionDays: detail.contract.paymentOptionDays,
                        storageFeeAmount: detail.contract.storageFeeAmount
                    }),
                    processStatusLabel: this.getProcessStatusLabel({
                        contractDate: detail.contract.contractDate,
                        contractStatus: detail.contract.contractStatus,
                        daysToMaturity
                    }),
                    availableActions: getAvailableActions({
                        contractStatus: detail.contract.contractStatus,
                        daysToMaturity
                    })
                };
            })
            .sort((left, right) => sortDateOnlyDesc(left.contract.contractDate, right.contract.contractDate));
    }

    getNasabahTable(params: GetPawnContractNasabahTableParamsModel & {
        nasabahTabs: Array<Omit<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>, 'count'>>;
    }): PawnContractNasabahTableModel {
        const tabRows = this.getNasabahTabRows(params.summaries, params.activeTab);
        const tabs = params.nasabahTabs.map((tab) => ({
            ...tab,
            count: this.getNasabahTabRows(params.summaries, tab.key).length
        }));
        const sections = this.createNasabahMonthlySections(tabRows);
        const activeTabMeta = tabs.find((tab) => tab.key === params.activeTab) ?? tabs[0];
        const activeSection = this.createNasabahSection(
            params.activeTab,
            activeTabMeta.label,
            activeTabMeta.description,
            tabRows
        );

        return {
            title: 'Active Contract List',
            description: 'Group active contracts by payment schedule and contract age for faster follow-up.',
            tabs,
            sections,
            activeSection,
            displayedSections: sections
        };
    }

    getRingkasanTable(params: GetPawnContractRingkasanTableParamsModel): PawnContractRingkasanTableModel {
        const todayRows = params.summaries.filter((item) =>
            isSameDateValue(item.contract.contractDate, getTodayDateValue())
        );
        const akadBaruRows = todayRows.filter((item) => item.contract.contractStatus !== 'extended');
        const akadUlangRows = params.summaries.filter(
            (item) =>
                item.contract.contractStatus === 'extended' &&
                isSameDateValue(item.contract.updatedAt, getTodayDateValue())
        );
        const pendapatanRows = todayRows.map((item) => ({
            contractId: item.contract.id,
            contractNumber: item.contract.contractNumber,
            customerName: item.customerName,
            branchName: item.branchName,
            storageFeeAmount: item.contract.storageFeeAmount,
            administrationFeeAmount: item.contract.administrationFeeAmount,
            totalIncome: item.contract.storageFeeAmount + item.contract.administrationFeeAmount
        }));
        const akadBaru = akadBaruRows.reduce((total, item) => total + item.contract.disbursedValue, 0);
        const akadUlang = akadUlangRows.reduce((total, item) => total + item.contract.disbursedValue, 0);
        const pendapatanBtitip = pendapatanRows.reduce((total, item) => total + item.storageFeeAmount, 0);
        const pendapatanBadmin = pendapatanRows.reduce((total, item) => total + item.administrationFeeAmount, 0);

        return {
            title: 'Aktivitas hari ini',
            description: 'Lihat realisasi gadai baru, gadai ulang, dan pendapatan harian.',
            sections: [
                {
                    key: 'akad_baru',
                    label: 'Data Gadai Baru',
                    description: 'Kontrak yang tercatat pada hari ini.',
                    rows: akadBaruRows
                },
                {
                    key: 'akad_ulang',
                    label: 'Data Gadai Ulang',
                    description: 'Kontrak berstatus perpanjangan yang diperbarui hari ini.',
                    rows: akadUlangRows
                }
            ],
            pendapatanRows,
            metrics: {
                akadBaru,
                akadUlang,
                totalRealisasi: akadBaru + akadUlang,
                pendapatanBtitip,
                pendapatanBadmin
            }
        };
    }

    getAjtTable(params: GetPawnContractAjtTableParamsModel & {
        ajtOptions: Array<Omit<PawnContractTableOptionModel<PawnContractAjtTypeModel>, 'count'>>;
    }): PawnContractAjtTableModel {
        return {
            title: 'Pilihan jenis jatuh tempo',
            description: 'Fokuskan pemantauan gadai aktif berdasarkan tenor dan tingkat keterlambatan.',
            options: params.ajtOptions.map((item) => ({
                ...item,
                count: this.getAjtRows(params.summaries, item.key).length
            })),
            rows: this.getAjtRows(params.summaries, params.activeType)
        };
    }

    getSettlementTable(params: GetPawnContractSettlementTableParamsModel & {
        settlementOptions: Array<Omit<PawnContractTableOptionModel<PawnContractSettlementTypeModel>, 'count'>>;
    }): PawnContractSettlementTableModel {
        return {
            title: 'Data lunas, lelang, dan refund',
            description: 'Satukan status penyelesaian kontrak agar proses back office lebih mudah dipantau.',
            options: params.settlementOptions.map((item) => ({
                ...item,
                count: this.getSettlementRows(params.summaries, item.key).length
            })),
            rows: this.getSettlementRows(params.summaries, params.activeType)
        };
    }

    getLocationTable(params: GetPawnContractLocationTableParamsModel & {
        locationOptions: Array<Omit<PawnContractTableOptionModel<PawnContractLocationTabModel>, 'count'>>;
    }): PawnContractLocationTableModel {
        return {
            title: 'Mutasi lokasi barang jaminan',
            description: 'Lacak barang jaminan per lokasi agar distribusi dan perpindahan tidak terlewat.',
            options: params.locationOptions.map((item) => ({
                ...item,
                count: this.getLocationRows(params.summaries, item.key).length
            })),
            rows: this.getLocationRows(params.summaries, params.activeTab)
        };
    }

    getMaintenanceTable(params: GetPawnContractMaintenanceTableParamsModel): PawnContractMaintenanceTableModel {
        return {
            title: 'Window maintenance operasional',
            description: 'Tampilkan gadai yang perlu inspeksi atau checklist maintenance dalam window kontrol.',
            rows: this.getMaintenanceRows(params.summaries)
        };
    }

    getIndexTabs(params: GetPawnContractIndexTabsParamsModel & {
        indexTabs: Array<Omit<PawnContractIndexTabModel, 'count'>>;
    }): PawnContractIndexTabModel[] {
        return params.indexTabs.map((item) => ({
            ...item,
            count: this.getIndexTabCount(item.key, params)
        }));
    }

    private createNasabahSection(
        key: string,
        label: string,
        description: string,
        rows: PawnContractSummaryModel[]
    ): PawnContractNasabahSectionModel {
        return {
            key,
            label,
            description,
            rows,
            totals: {
                principalAmount: rows.reduce((total, item) => total + item.contract.disbursedValue, 0),
                arrearsAmount: rows.reduce((total, item) => total + item.arrears.overdueAmount, 0),
                dueTodayAmount: rows.reduce((total, item) => total + item.arrears.dueTodayAmount, 0)
            }
        };
    }

    private createNasabahMonthlySections(
        rows: PawnContractSummaryModel[]
    ): PawnContractNasabahSectionModel[] {
        const currentMonthRows = rows.filter((item) => getMonthOffsetFromToday(item.contract.contractDate) === 0);
        const oneMonthAgoRows = rows.filter((item) => getMonthOffsetFromToday(item.contract.contractDate) === 1);
        const twoMonthAgoRows = rows.filter((item) => getMonthOffsetFromToday(item.contract.contractDate) === 2);
        const threeMonthAgoRows = rows.filter((item) => getMonthOffsetFromToday(item.contract.contractDate) >= 3);

        return [
            this.createNasabahSection(
                'bulan_berjalan',
                'Current Month',
                'Active contracts created in the current month.',
                currentMonthRows
            ),
            this.createNasabahSection(
                'satu_bulan_lalu',
                '1 Month Ago',
                'Active contracts created in the previous month.',
                oneMonthAgoRows
            ),
            this.createNasabahSection(
                'dua_bulan_lalu',
                '2 Months Ago',
                'Active contracts created two months ago.',
                twoMonthAgoRows
            ),
            this.createNasabahSection(
                'tiga_bulan_atau_lebih',
                '3+ Months Ago',
                'Older active contracts that still need follow-up.',
                threeMonthAgoRows
            )
        ];
    }

    private getNasabahTabRows(
        rows: PawnContractSummaryModel[],
        tab: PawnContractNasabahTabKeyModel
    ): PawnContractSummaryModel[] {
        switch (tab) {
            case PawnContractNasabahTabKeyEnum.Daily:
                return rows.filter((item) => item.contract.paymentOptionDays === 1);
            case PawnContractNasabahTabKeyEnum.SevenDays:
                return rows.filter((item) => item.contract.paymentOptionDays === 7);
            case PawnContractNasabahTabKeyEnum.FifteenDays:
                return rows.filter((item) => item.contract.paymentOptionDays === 15);
            default:
                return rows;
        }
    }

    private getAjtRows(
        rows: PawnContractSummaryModel[],
        type: PawnContractAjtTypeModel
    ): PawnContractSummaryModel[] {
        switch (type) {
            case '7':
            case '15':
            case '30':
            case '60':
                return rows.filter(
                    (item) =>
                        item.contract.termDays === Number(type) &&
                        item.daysToMaturity >= 0 &&
                        item.daysToMaturity <= 7
                );
            case 'tertunggak':
                return rows.filter((item) => item.daysToMaturity < 0);
            case 'mendekati_tempo_lelang':
                return rows.filter((item) => item.daysToMaturity < 0 && item.daysToMaturity >= -7);
            case 'tempo_lelang':
                return rows.filter((item) => item.daysToMaturity < -7 && item.daysToMaturity >= -21);
            case 'tunda_lelang':
                return rows.filter(
                    (item) => item.contract.contractStatus === 'extended' && item.daysToMaturity < 0
                );
            default:
                return rows;
        }
    }

    private getSettlementRows(
        rows: PawnContractSummaryModel[],
        type: PawnContractSettlementTypeModel
    ): PawnContractSummaryModel[] {
        switch (type) {
            case 'lunas':
                return rows.filter((item) => ['redeemed', 'closed'].includes(item.contract.contractStatus));
            case 'lelang':
                return rows.filter((item) => item.contract.contractStatus === 'auctioned');
            case 'refund':
                return rows.filter((item) => item.contract.contractStatus === 'cancelled');
            default:
                return rows;
        }
    }

    private getLocationRows(
        rows: PawnContractSummaryModel[],
        type: PawnContractLocationTabModel
    ): PawnContractLocationRowModel[] {
        return rows
            .flatMap((summary) =>
                summary.items.map((itemDetail) => ({
                    itemId: itemDetail.item.id,
                    contractId: summary.contract.id,
                    contractNumber: summary.contract.contractNumber,
                    itemName: itemDetail.item.itemName,
                    customerName: summary.customerName,
                    branchName: summary.branchName,
                    currentLocationStatus: itemDetail.item.currentLocationStatus,
                    currentLocationLabel: getPawnItemLocationStatusLabel(itemDetail.item.currentLocationStatus),
                    primaryActionLabel: this.getPrimaryLocationActionLabel(itemDetail.item.currentLocationStatus),
                    secondaryActionLabel:
                        type === 'proses'
                            ? this.getSecondaryLocationActionLabel(itemDetail.item.currentLocationStatus)
                            : null
                }))
            )
            .filter((row) => {
                switch (type) {
                    case 'kantor':
                        return row.currentLocationStatus === 'in_office';
                    case 'gudang':
                        return row.currentLocationStatus === 'in_warehouse';
                    case 'proses':
                        return !['in_office', 'in_warehouse'].includes(row.currentLocationStatus ?? '');
                    default:
                        return true;
                }
            });
    }

    private getMaintenanceRows(rows: PawnContractSummaryModel[]): PawnContractMaintenanceRowModel[] {
        return rows
            .filter((item) => {
                const daysSinceContract = Math.max(0, -getPawnContractDaysToDate(item.contract.contractDate));
                return (
                    daysSinceContract >= 15 &&
                    daysSinceContract <= 30 &&
                    ![1, 7].includes(item.contract.termDays)
                );
            })
            .map((item) => ({
                contractId: item.contract.id,
                customerName: item.customerName,
                itemNames: item.itemNames,
                contractDate: item.contract.contractDate,
                checklistLabel: item.contract.maintenanceRequired ? 'Belum Diperiksa' : 'Sudah Diperiksa',
                maintenanceRequired: item.contract.maintenanceRequired
            }))
            .sort((left, right) => sortDateOnlyDesc(left.contractDate, right.contractDate));
    }

    private getIndexTabCount(
        key: PawnContractIndexTabModel['key'],
        params: GetPawnContractIndexTabsParamsModel
    ): number {
        switch (key) {
            case PawnContractIndexTabKeyEnum.CustomerContracts:
                return params.openContractCount;
            case PawnContractIndexTabKeyEnum.DailySummary:
                return params.ringkasanRowCount;
            case PawnContractIndexTabKeyEnum.DueContracts:
                return params.ajtRowCount;
            case PawnContractIndexTabKeyEnum.SettlementAuction:
                return params.settlementRowCount;
            case PawnContractIndexTabKeyEnum.LocationDistribution:
                return params.locationRowCount;
            case PawnContractIndexTabKeyEnum.Maintenance:
                return params.maintenanceRowCount;
            default:
                return 0;
        }
    }

    private getProcessStatusLabel(params: {
        contractDate: string;
        contractStatus: PawnContractStatusModel;
        daysToMaturity: number;
    }): string {
        if (isSameDateValue(params.contractDate, getTodayDateValue())) {
            return 'Data Baru';
        }

        switch (params.contractStatus) {
            case 'extended':
                return 'Perpanjangan';
            case 'redeemed':
            case 'closed':
                return 'Pelunasan';
            case 'auctioned':
                return 'Lelang';
            case 'cancelled':
                return 'Refund';
            default:
                break;
        }

        if (params.daysToMaturity < 0) {
            return 'Lelang';
        }

        if (params.daysToMaturity <= 7) {
            return 'Bayar Biaya Titip';
        }

        return 'Gadai Aktif';
    }

    private getPrimaryLocationActionLabel(status: string | null): string {
        switch (status) {
            case 'in_office':
                return 'Kirim ke Gudang';
            case 'in_warehouse':
                return 'Kirim ke Kantor';
            default:
                return 'Tinjau Lokasi';
        }
    }

    private getSecondaryLocationActionLabel(status: string | null): string | null {
        if (!status || ['in_office', 'in_warehouse'].includes(status)) {
            return null;
        }

        return 'Kembalikan ke Kantor';
    }
}
