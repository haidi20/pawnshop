import { ref, type Ref } from 'vue';

import type {
    PawnContractAjtTypeModel,
    PawnContractDataModel,
    PawnContractIndexTabKeyModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractStatusModel } from '@core/util/helpers';
export type {
    PawnContractAjtTypeModel,
    PawnContractIndexTabKeyModel,
    PawnContractLocationTabModel,
    PawnContractNasabahTabKeyModel,
    PawnContractSettlementTypeModel
} from '@feature/pawn_contract/domain/models';

export interface IPawnContractState {
    data: Ref<PawnContractDataModel | null>;
    filteredData: Ref<PawnContractDataModel | null>;
    isLoading: Ref<boolean>;
    error: Ref<string | null>;
    activeIndexTab: Ref<PawnContractIndexTabKeyModel>;
    activeNasabahTab: Ref<PawnContractNasabahTabKeyModel>;
    activeAjtType: Ref<PawnContractAjtTypeModel>;
    activeSettlementType: Ref<PawnContractSettlementTypeModel>;
    activeLocationTab: Ref<PawnContractLocationTabModel>;
    branchFilter: Ref<string>;
    statusFilter: Ref<'all' | PawnContractStatusModel>;
}

export type PawnContractTableField = {
    key: string;
    label: string;
    thClass?: string;
    tdClass?: string;
};

export const nasabahTableFields = [
    { key: 'customerName', label: 'Nama' },
    { key: 'customerPhone', label: 'No. Telp' },
    { key: 'customerIdentity', label: 'ID' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'principalAmount', label: 'Pinjaman' },
    { key: 'arrearsAmount', label: 'Tunggakan' },
    { key: 'contractDate', label: 'Tanggal Akad' },
    { key: 'maturityDate', label: 'Jatuh Tempo' },
    { key: 'processStatusLabel', label: 'Status Proses' },
    { key: 'actions', label: 'Aksi', thClass: 'text-end', tdClass: 'text-end' }
] satisfies PawnContractTableField[];

export const ringkasanTableFields = [
    { key: 'contractNumber', label: 'No. Akad' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'principalAmount', label: 'Pinjaman' },
    { key: 'statusLabel', label: 'Status' }
] satisfies PawnContractTableField[];

export const ringkasanPendapatanTableFields = [
    { key: 'contractNumber', label: 'No. Akad' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'branchName', label: 'Cabang' },
    { key: 'storageFeeAmount', label: 'B. Titip' },
    { key: 'administrationFeeAmount', label: 'B. Admin' },
    { key: 'totalIncome', label: 'Total' }
] satisfies PawnContractTableField[];

export const ajtTableFields = [
    { key: 'contractNumber', label: 'No. Akad' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'maturityDate', label: 'Jatuh Tempo' },
    { key: 'termLabel', label: 'Tenor' },
    { key: 'statusLabel', label: 'Status' },
    { key: 'actions', label: 'Aksi', thClass: 'text-end', tdClass: 'text-end' }
] satisfies PawnContractTableField[];

export const settlementTableFields = [
    { key: 'contractNumber', label: 'No. Akad' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'itemNames', label: 'Jaminan' },
    { key: 'settlementDate', label: 'Tanggal' },
    { key: 'principalAmount', label: 'Nilai' },
    { key: 'statusLabel', label: 'Status' }
] satisfies PawnContractTableField[];

export const locationTableFields = [
    { key: 'sequence', label: 'No' },
    { key: 'itemName', label: 'Nama Barang' },
    { key: 'customerName', label: 'Nasabah' },
    { key: 'branchName', label: 'Cabang' },
    { key: 'currentLocationLabel', label: 'Lokasi' },
    { key: 'actions', label: 'Action' },
    { key: 'print', label: 'Print' }
] satisfies PawnContractTableField[];

export const maintenanceTableFields = [
    { key: 'contractId', label: 'ID' },
    { key: 'customerName', label: 'Nama Nasabah' },
    { key: 'itemNames', label: 'Nama Barang' },
    { key: 'contractDate', label: 'Tanggal Akad' },
    { key: 'checklistLabel', label: 'Ceklis' },
    { key: 'print', label: 'Print' }
] satisfies PawnContractTableField[];

export const createPawnContractState = (): IPawnContractState => ({
    data: ref(null),
    filteredData: ref(null),
    isLoading: ref(false),
    error: ref(null),
    activeIndexTab: ref('nasabah_akad'),
    activeNasabahTab: ref('seluruh_data'),
    activeAjtType: ref('30'),
    activeSettlementType: ref('lunas'),
    activeLocationTab: ref('kantor'),
    branchFilter: ref('all'),
    statusFilter: ref('all')
});
