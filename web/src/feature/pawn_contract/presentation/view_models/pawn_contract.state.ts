import { ref, type Ref } from 'vue';

import type {
    PawnContractAjtTypeModel,
    PawnContractDataModel,
    PawnContractIndexTabKeyModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel
} from '@feature/pawn_contract/domain/models';
import {
    PawnContractIndexTabKeyEnum,
    PawnContractNasabahTabKeyEnum,
    type PawnContractActionKeyModel,
    type PawnContractActionOptionModel
} from '@feature/pawn_contract/domain/models';
import {
    createEmptyIndexTabFilters,
    type PawnContractIndexTabFilterStateModel
} from '@feature/pawn_contract/presentation/view_models/pawn_contract_index_filters';
export type {
    PawnContractAjtTypeModel,
    PawnContractIndexTabKeyModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyEnum,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel
} from '@feature/pawn_contract/domain/models';

export interface IPawnContractState {
    data: Ref<PawnContractDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    activeIndexTab: Ref<PawnContractIndexTabKeyModel>;
    activeNasabahTab: Ref<PawnContractNasabahTabKeyModel>;
    activeAjtType: Ref<PawnContractAjtTypeModel>;
    activeSettlementType: Ref<PawnContractSettlementTypeModel>;
    activeLocationTab: Ref<PawnContractLocationTabModel>;
    tableFilters: Ref<PawnContractIndexTabFilterStateModel>;
}

export const pawnContractActionOptions: PawnContractActionOptionModel[] = [
    {
        key: 'edit',
        label: 'Ubah Data',
        description: 'Buka form gadai untuk memperbarui data kontrak dan jaminan.'
    },
    {
        key: 'history',
        label: 'History',
        description: 'Lihat ringkasan riwayat perubahan, jatuh tempo, dan aktivitas penting gadai.'
    },
    {
        key: 'storage_fee',
        label: 'Bayar Biaya Titip',
        description: 'Tandai tindak lanjut pembayaran biaya titip untuk gadai yang masih berjalan.'
    },
    {
        key: 'settlement',
        label: 'Pelunasan',
        description: 'Siapkan proses pelunasan jika nasabah ingin menutup gadai.'
    },
    {
        key: 'extension',
        label: 'Perpanjangan',
        description: 'Lanjutkan gadai dengan proses perpanjangan atau gadai ulang.'
    },
    {
        key: 'auction',
        label: 'Lelang',
        description: 'Tindak lanjuti gadai yang sudah lewat jatuh tempo atau masuk proses lelang.'
    }
];

export const getPawnContractAvailableActions = (params: {
    contractStatus: string;
    daysToMaturity: number;
}): PawnContractActionOptionModel[] => {
    const availableKeys: PawnContractActionKeyModel[] = ['edit', 'history'];

    if (['active', 'extended'].includes(params.contractStatus)) {
        availableKeys.push('storage_fee');
        availableKeys.push('settlement');
    }

    if (params.contractStatus === 'active') {
        availableKeys.push('extension');
    }

    if (params.daysToMaturity < 0 || params.contractStatus === 'auctioned') {
        availableKeys.push('auction');
    }

    return pawnContractActionOptions.filter((action) => availableKeys.includes(action.key));
};

export type PawnContractTableField = {
    key: string;
    label: string;
    thClass?: string;
    tdClass?: string;
};

export const nasabahTableFields = [
    { key: 'actions', label: 'Aksi' },
    { key: 'customerName', label: 'Nama' },
    { key: 'customerPhone', label: 'No. Telp' },
    { key: 'customerIdentity', label: 'ID' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'principalAmount', label: 'Pinjaman' },
    { key: 'arrearsAmount', label: 'Tunggakan' },
    { key: 'contractDate', label: 'Tanggal Gadai' },
    { key: 'maturityDate', label: 'Jatuh Tempo' },
    { key: 'processStatusLabel', label: 'Status Proses' }
] satisfies PawnContractTableField[];

export const ringkasanTableFields = [
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'principalAmount', label: 'Pinjaman' },
    { key: 'statusLabel', label: 'Status' }
] satisfies PawnContractTableField[];

export const ringkasanPendapatanTableFields = [
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'branchName', label: 'Cabang' },
    { key: 'storageFeeAmount', label: 'B. Titip' },
    { key: 'administrationFeeAmount', label: 'B. Admin' },
    { key: 'totalIncome', label: 'Total' }
] satisfies PawnContractTableField[];

export const ajtTableFields = [
    { key: 'actions', label: 'Aksi' },
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'maturityDate', label: 'Jatuh Tempo' },
    { key: 'termLabel', label: 'Tenor' },
    { key: 'statusLabel', label: 'Status' }
] satisfies PawnContractTableField[];

export const settlementTableFields = [
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'settlementDate', label: 'Tanggal' },
    { key: 'principalAmount', label: 'Nilai' },
    { key: 'statusLabel', label: 'Status' }
] satisfies PawnContractTableField[];

export const locationTableFields = [
    { key: 'actions', label: 'Aksi' },
    { key: 'print', label: 'Print' },
    { key: 'sequence', label: 'No' },
    { key: 'itemName', label: 'Nama Barang' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'branchName', label: 'Cabang' },
    { key: 'currentLocationLabel', label: 'Lokasi' }
] satisfies PawnContractTableField[];

export const maintenanceTableFields = [
    { key: 'print', label: 'Print' },
    { key: 'contractId', label: 'ID' },
    { key: 'customerName', label: 'Nama Nasabah' },
    { key: 'itemNames', label: 'Nama Barang' },
    { key: 'contractDate', label: 'Tanggal Gadai' },
    { key: 'checklistLabel', label: 'Ceklis' }
] satisfies PawnContractTableField[];

export const createPawnContractState = (): IPawnContractState => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null),
    activeIndexTab: ref(PawnContractIndexTabKeyEnum.CustomerContracts),
    activeNasabahTab: ref(PawnContractNasabahTabKeyEnum.AllData),
    activeAjtType: ref('30'),
    activeSettlementType: ref('lunas'),
    activeLocationTab: ref('kantor'),
    tableFilters: ref(createEmptyIndexTabFilters())
});
