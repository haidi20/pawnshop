import type {
    PawnContractDueStateModel,
    PawnContractEstimatedArrearsModel
} from '@core/util/helpers';
import type { PawnContractDetailModel } from '@feature/pawn_contract/domain/models/pawn-contract-detail.model';
import type { PawnItemLocationStatusModel } from '@feature/pawn_contract/domain/models/pawn-item.model';

export type PawnContractIndexTabKeyModel =
    | 'nasabah_akad'
    | 'ringkasan_harian'
    | 'akad_jatuh_tempo'
    | 'pelunasan_lelang'
    | 'lokasi_distribusi'
    | 'maintenance';

export type PawnContractNasabahTabKeyModel =
    | 'seluruh_data'
    | 'harian'
    | 'tujuh_hari'
    | 'lima_belas_hari';

export type PawnContractAjtTypeModel =
    | '7'
    | '15'
    | '30'
    | '60'
    | 'tertunggak'
    | 'mendekati_tempo_lelang'
    | 'tempo_lelang'
    | 'tunda_lelang';

export type PawnContractSettlementTypeModel = 'lunas' | 'lelang' | 'refund';
export type PawnContractLocationTabModel = 'kantor' | 'proses' | 'gudang';
export type PawnContractActionKeyModel =
    | 'edit'
    | 'history'
    | 'storage_fee'
    | 'extension'
    | 'settlement'
    | 'auction';

export interface PawnContractActionOptionModel {
    key: PawnContractActionKeyModel;
    label: string;
    description: string;
}

export interface PawnContractSummaryModel extends PawnContractDetailModel {
    customerName: string;
    customerPhone: string;
    customerIdentity: string;
    branchName: string;
    itemNames: string;
    locationLabel: string;
    daysToMaturity: number;
    dueState: PawnContractDueStateModel;
    dueLabel: string;
    hasWarehouseItem: boolean;
    isOpenContract: boolean;
    arrears: PawnContractEstimatedArrearsModel;
    processStatusLabel: string;
    availableActions: PawnContractActionOptionModel[];
}

export interface GetPawnContractNasabahTableParamsModel {
    summaries: PawnContractSummaryModel[];
    activeTab: PawnContractNasabahTabKeyModel;
}

export interface GetPawnContractRingkasanTableParamsModel {
    summaries: PawnContractSummaryModel[];
}

export interface GetPawnContractAjtTableParamsModel {
    summaries: PawnContractSummaryModel[];
    activeType: PawnContractAjtTypeModel;
}

export interface GetPawnContractSettlementTableParamsModel {
    summaries: PawnContractSummaryModel[];
    activeType: PawnContractSettlementTypeModel;
}

export interface GetPawnContractLocationTableParamsModel {
    summaries: PawnContractSummaryModel[];
    activeTab: PawnContractLocationTabModel;
}

export interface GetPawnContractMaintenanceTableParamsModel {
    summaries: PawnContractSummaryModel[];
}

export interface GetPawnContractIndexTabsParamsModel {
    openContractCount: number;
    ringkasanRowCount: number;
    ajtRowCount: number;
    settlementRowCount: number;
    locationRowCount: number;
    maintenanceRowCount: number;
}

export interface PawnContractTableOptionModel<TKey extends string> {
    key: TKey;
    label: string;
    description: string;
    count: number;
}

export interface PawnContractIndexTabModel extends PawnContractTableOptionModel<PawnContractIndexTabKeyModel> {}

export interface PawnContractNasabahSectionModel {
    key: string;
    label: string;
    description: string;
    rows: PawnContractSummaryModel[];
    totals: {
        principalAmount: number;
        arrearsAmount: number;
        dueTodayAmount: number;
    };
}

export interface PawnContractNasabahTableModel {
    title: string;
    description: string;
    tabs: Array<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>>;
    sections: PawnContractNasabahSectionModel[];
    activeSection: PawnContractNasabahSectionModel;
    displayedSections: PawnContractNasabahSectionModel[];
}

export interface PawnContractRingkasanSectionModel {
    key: string;
    label: string;
    description: string;
    rows: PawnContractSummaryModel[];
}

export interface PawnContractRingkasanPendapatanRowModel {
    contractId: number;
    contractNumber: string;
    customerName: string;
    branchName: string;
    storageFeeAmount: number;
    administrationFeeAmount: number;
    totalIncome: number;
}

export interface PawnContractRingkasanMetricModel {
    akadBaru: number;
    akadUlang: number;
    totalRealisasi: number;
    pendapatanBtitip: number;
    pendapatanBadmin: number;
}

export interface PawnContractRingkasanTableModel {
    title: string;
    description: string;
    sections: PawnContractRingkasanSectionModel[];
    pendapatanRows: PawnContractRingkasanPendapatanRowModel[];
    metrics: PawnContractRingkasanMetricModel;
}

export interface PawnContractAjtTableModel {
    title: string;
    description: string;
    options: Array<PawnContractTableOptionModel<PawnContractAjtTypeModel>>;
    rows: PawnContractSummaryModel[];
}

export interface PawnContractSettlementTableModel {
    title: string;
    description: string;
    options: Array<PawnContractTableOptionModel<PawnContractSettlementTypeModel>>;
    rows: PawnContractSummaryModel[];
}

export interface PawnContractLocationRowModel {
    itemId: number;
    contractId: number;
    contractNumber: string;
    itemName: string;
    customerName: string;
    branchName: string;
    currentLocationStatus: PawnItemLocationStatusModel | null;
    currentLocationLabel: string;
    primaryActionLabel: string;
    secondaryActionLabel: string | null;
}

export interface PawnContractLocationTableModel {
    title: string;
    description: string;
    options: Array<PawnContractTableOptionModel<PawnContractLocationTabModel>>;
    rows: PawnContractLocationRowModel[];
}

export interface PawnContractMaintenanceRowModel {
    contractId: number;
    customerName: string;
    itemNames: string;
    contractDate: string;
    checklistLabel: string;
    maintenanceRequired: boolean;
}

export interface PawnContractMaintenanceTableModel {
    title: string;
    description: string;
    rows: PawnContractMaintenanceRowModel[];
}
