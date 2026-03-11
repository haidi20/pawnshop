import type { Either } from 'fp-ts/Either';
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
    getData(filters?: PawnContractDataFilterModel): Promise<Either<Error, PawnContractDataModel>>;
    getFormReferenceData(): Promise<Either<Error, PawnContractFormReferenceModel>>;
    getFormValue(contractId: number): Promise<Either<Error, PawnContractFormValueModel>>;
    saveContract(payload: SavePawnContractPayloadModel): Promise<Either<Error, SavePawnContractResultModel>>;
    getContractSummaries(data: PawnContractDataModel | null): Either<Error, PawnContractSummaryModel[]>;
    getNasabahTable(
        params: GetPawnContractNasabahTableParamsModel
    ): Either<Error, PawnContractNasabahTableModel>;
    getRingkasanTable(
        params: GetPawnContractRingkasanTableParamsModel
    ): Either<Error, PawnContractRingkasanTableModel>;
    getAjtTable(params: GetPawnContractAjtTableParamsModel): Either<Error, PawnContractAjtTableModel>;
    getSettlementTable(
        params: GetPawnContractSettlementTableParamsModel
    ): Either<Error, PawnContractSettlementTableModel>;
    getLocationTable(
        params: GetPawnContractLocationTableParamsModel
    ): Either<Error, PawnContractLocationTableModel>;
    getMaintenanceTable(
        params: GetPawnContractMaintenanceTableParamsModel
    ): Either<Error, PawnContractMaintenanceTableModel>;
    getIndexTabs(params: GetPawnContractIndexTabsParamsModel): Either<Error, PawnContractIndexTabModel[]>;
}
