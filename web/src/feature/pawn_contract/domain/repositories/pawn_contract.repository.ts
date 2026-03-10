import type {
    GetPawnContractAjtTableParamsModel,
    PawnContractDataFilterModel,
    PawnContractDataModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    GetPawnContractIndexTabsParamsModel,
    GetPawnContractLocationTableParamsModel,
    GetPawnContractMaintenanceTableParamsModel,
    GetPawnContractNasabahTableParamsModel,
    GetPawnContractRingkasanTableParamsModel,
    GetPawnContractSettlementTableParamsModel,
    PawnContractAjtTableModel,
    PawnContractIndexTabModel,
    PawnContractLocationTableModel,
    PawnContractMaintenanceTableModel,
    PawnContractNasabahTableModel,
    PawnContractRingkasanTableModel,
    PawnContractSettlementTableModel,
    PawnContractSummaryModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';

export interface PawnContractRepository {
    getData(filters?: PawnContractDataFilterModel): Promise<PawnContractDataModel>;
    getFormReferenceData(): Promise<PawnContractFormReferenceModel>;
    getFormValue(contractId: number): Promise<PawnContractFormValueModel>;
    saveContract(payload: SavePawnContractPayloadModel): Promise<SavePawnContractResultModel>;
    getContractSummaries(data: PawnContractDataModel | null): PawnContractSummaryModel[];
    getNasabahTable(params: GetPawnContractNasabahTableParamsModel): PawnContractNasabahTableModel;
    getRingkasanTable(params: GetPawnContractRingkasanTableParamsModel): PawnContractRingkasanTableModel;
    getAjtTable(params: GetPawnContractAjtTableParamsModel): PawnContractAjtTableModel;
    getSettlementTable(params: GetPawnContractSettlementTableParamsModel): PawnContractSettlementTableModel;
    getLocationTable(params: GetPawnContractLocationTableParamsModel): PawnContractLocationTableModel;
    getMaintenanceTable(params: GetPawnContractMaintenanceTableParamsModel): PawnContractMaintenanceTableModel;
    getIndexTabs(params: GetPawnContractIndexTabsParamsModel): PawnContractIndexTabModel[];
}
