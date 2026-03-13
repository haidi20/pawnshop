import { ref, type Ref } from 'vue';

import type {
    PawnContractAjtTypeModel,
    PawnContractDataModel,
    PawnContractIndexTabKeyModel,
    PawnContractIndexTabModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel,
    PawnContractTableOptionModel
} from '@feature/pawn_contract/domain/models';
import {
    PawnContractIndexTabKeyEnum,
    PawnContractNasabahTabKeyEnum,
    type PawnContractActionKeyModel,
    type PawnContractActionOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractStatusModel } from '@core/util/helpers';
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

export const redeemedTableFields: PawnContractTableField[] = [
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'redeemedDate', label: 'Tanggal Lunas' },
    { key: 'principalAmount', label: 'Nilai Pencairan' },
    { key: 'statusLabel', label: 'Status' }
];

export const auctionTableFields: PawnContractTableField[] = [
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'auctionDate', label: 'Tanggal Lelang' },
    { key: 'principalAmount', label: 'Nilai Pencairan' },
    { key: 'statusLabel', label: 'Status' }
];

export const refundTableFields: PawnContractTableField[] = [
    { key: 'contractNumber', label: 'No. Gadai' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'refundDate', label: 'Tanggal Refund' },
    { key: 'principalAmount', label: 'Nilai Pencairan' },
    { key: 'statusLabel', label: 'Status' }
];

export const locationTableFields = [
    { key: 'actions', label: 'Aksi' },
    { key: 'print', label: 'Cetak' },
    { key: 'sequence', label: 'No' },
    { key: 'itemName', label: 'Nama Barang' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'branchName', label: 'Cabang' },
    { key: 'currentLocationLabel', label: 'Lokasi' }
] satisfies PawnContractTableField[];

export const maintenanceTableFields = [
    { key: 'print', label: 'Cetak' },
    { key: 'contractId', label: 'ID' },
    { key: 'customerName', label: 'Nama Nasabah' },
    { key: 'itemNames', label: 'Nama Barang' },
    { key: 'contractDate', label: 'Tanggal Gadai' },
    { key: 'checklistLabel', label: 'Ceklis' }
] satisfies PawnContractTableField[];

export const RUNNING_CONTRACT_STATUSES = new Set<PawnContractStatusModel>(['active', 'extended']);

export const PAWN_CONTRACT_INDEX_TABS: Array<Omit<PawnContractIndexTabModel, 'count'>> = [
    {
        key: PawnContractIndexTabKeyEnum.CustomerContracts,
        label: 'Nasabah Gadai',
        description: 'Pantau daftar nasabah aktif, jatuh tempo, dan tindak lanjut utama berdasarkan filter cabang dan status.'
    },
    {
        key: PawnContractIndexTabKeyEnum.DailySummary,
        label: 'Ringkasan Harian',
        description: 'Ringkas pergerakan gadai dan pendapatan harian untuk membantu monitoring operasional yang lebih cepat.'
    },
    {
        key: PawnContractIndexTabKeyEnum.DueContracts,
        label: 'Gadai Jatuh Tempo',
        description: 'Kelompokkan gadai yang mendekati atau melewati jatuh tempo agar tindak lanjut tidak tertinggal.'
    },
    {
        key: PawnContractIndexTabKeyEnum.RedeemedContracts,
        label: 'Lunas',
        description: 'Daftar kontrak yang sudah dilunasi oleh nasabah secara penuh.'
    },
    {
        key: PawnContractIndexTabKeyEnum.AuctionContracts,
        label: 'Lelang',
        description: 'Daftar kontrak yang sudah masuk dalam proses lelang.'
    },
    {
        key: PawnContractIndexTabKeyEnum.RefundContracts,
        label: 'Refund',
        description: 'Daftar kontrak batal yang memerlukan proses pengembalian (refund).'
    },
    {
        key: PawnContractIndexTabKeyEnum.LocationDistribution,
        label: 'Lokasi / Distribusi',
        description: 'Lihat perpindahan dan lokasi barang jaminan per cabang tanpa pindah halaman.'
    },
    {
        key: PawnContractIndexTabKeyEnum.Maintenance,
        label: 'Maintenance',
        description: 'Awasi kontrak yang masuk window maintenance dan ceklis operasional yang perlu ditangani.'
    }
];

export const PAWN_CONTRACT_NASABAH_TABS: Array<
    Omit<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>, 'count'>
> = [
        {
            key: PawnContractNasabahTabKeyEnum.AllData,
            label: 'Semua Data',
            description: 'Tinjau kontrak aktif yang dikelompokkan berdasarkan bulan kontrak.'
        },
        {
            key: PawnContractNasabahTabKeyEnum.Daily,
            label: 'Harian',
            description: 'Kontrak aktif dengan jadwal pembayaran harian.'
        },
        {
            key: PawnContractNasabahTabKeyEnum.SevenDays,
            label: '7 Hari',
            description: 'Kontrak aktif dengan jadwal pembayaran 7 harian.'
        },
        {
            key: PawnContractNasabahTabKeyEnum.FifteenDays,
            label: '15 Hari',
            description: 'Kontrak aktif dengan jadwal pembayaran 15 harian.'
        }
    ];

export const PAWN_CONTRACT_AJT_OPTIONS: Array<
    Omit<PawnContractTableOptionModel<PawnContractAjtTypeModel>, 'count'>
> = [
        { key: '7', label: '7 Hari', description: 'Gadai tenor 7 hari yang masih aktif dan mendekati jatuh tempo.' },
        { key: '15', label: '15 Hari', description: 'Gadai tenor 15 hari yang perlu dipantau menjelang jatuh tempo.' },
        { key: '30', label: '30 Hari', description: 'Gadai tenor 30 hari yang jatuh tempo dalam waktu dekat.' },
        { key: '60', label: '60 Hari', description: 'Gadai tenor 60 hari yang mendekati tenggat kontrak.' },
        { key: 'tertunggak', label: 'Tertunggak', description: 'Gadai aktif yang sudah melewati jatuh tempo.' },
        {
            key: 'mendekati_tempo_lelang',
            label: 'Mendekati Lelang',
            description: 'Gadai overdue awal yang masih punya ruang tindak lanjut sebelum lelang.'
        },
        {
            key: 'tempo_lelang',
            label: 'Tempo Lelang',
            description: 'Gadai overdue lebih lanjut yang mulai masuk window lelang.'
        },
        {
            key: 'tunda_lelang',
            label: 'Tunda Lelang',
            description: 'Gadai perpanjangan yang tetap overdue dan perlu keputusan lanjutan.'
        }
    ];

export const PAWN_CONTRACT_SETTLEMENT_OPTIONS: Array<
    Omit<PawnContractTableOptionModel<PawnContractSettlementTypeModel>, 'count'>
> = [
        { key: 'lunas', label: 'Lunas', description: 'Kontrak yang sudah selesai melalui pelunasan atau penutupan.' },
        { key: 'lelang', label: 'Lelang', description: 'Kontrak yang berakhir melalui proses lelang.' },
        { key: 'refund', label: 'Refund', description: 'Kontrak batal yang memerlukan tindak lanjut pengembalian.' }
    ];

export const PAWN_CONTRACT_LOCATION_OPTIONS: Array<
    Omit<PawnContractTableOptionModel<PawnContractLocationTabModel>, 'count'>
> = [
        { key: 'kantor', label: 'Kantor', description: 'Barang jaminan yang saat ini berada di kantor cabang.' },
        { key: 'proses', label: 'Proses', description: 'Barang jaminan yang sedang bergerak atau diproses.' },
        { key: 'gudang', label: 'Gudang', description: 'Barang jaminan yang saat ini berada di gudang.' }
    ];

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
