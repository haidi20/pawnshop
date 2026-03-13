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
    PawnContractAjtTypeModel,
    PawnContractIndexTabModel,
    PawnContractLocationTableModel,
    PawnContractLocationTabModel,
    PawnContractMaintenanceTableModel,
    PawnContractNasabahTabKeyModel,
    PawnContractNasabahTableModel,
    PawnContractRingkasanTableModel,
    PawnContractSettlementTableModel,
    PawnContractSettlementTypeModel,
    PawnContractSummaryModel,
    PawnContractTableOptionModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel,
    GuideItemTypeSeed,
    PawnContractItemKindModel,
    PawnContractItemPresetModel,
    PawnContractActionOptionModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractStatusModel } from '@core/util/helpers';

export interface PawnContractRepository {
    getData(filters?: PawnContractDataFilterModel): Promise<Either<Error, PawnContractDataModel>>;
    getHistorySummaryById(contractId: number): Promise<Either<Error, PawnContractSummaryModel | null>>;
    getFormReferenceData(params: {
        guideItemTypeSeeds: GuideItemTypeSeed[];
        itemPresetMeta: Record<
            PawnContractItemKindModel,
            Pick<PawnContractItemPresetModel, 'label' | 'description' | 'administrationFeeAmount' | 'detailLabels'>
        >;
    }): Promise<Either<Error, PawnContractFormReferenceModel>>;
    getFormValue(params: {
        contractId: number;
        guideItemTypeSeeds: GuideItemTypeSeed[];
    }): Promise<Either<Error, PawnContractFormValueModel>>;
    saveContract(params: {
        payload: SavePawnContractPayloadModel;
        guideItemTypeSeeds: GuideItemTypeSeed[];
    }): Promise<Either<Error, SavePawnContractResultModel>>;
    getContractSummaries(params: {
        data: PawnContractDataModel | null;
        runningContractStatuses: Set<PawnContractStatusModel>;
        getAvailableActions: (params: { contractStatus: string; daysToMaturity: number }) => PawnContractActionOptionModel[];
    }): Either<Error, PawnContractSummaryModel[]>;
    getNasabahTable(
        params: GetPawnContractNasabahTableParamsModel & {
            nasabahTabs: Array<Omit<PawnContractTableOptionModel<PawnContractNasabahTabKeyModel>, 'count'>>;
        }
    ): Either<Error, PawnContractNasabahTableModel>;
    getRingkasanTable(
        params: GetPawnContractRingkasanTableParamsModel
    ): Either<Error, PawnContractRingkasanTableModel>;
    getAjtTable(params: GetPawnContractAjtTableParamsModel & {
        ajtOptions: Array<Omit<PawnContractTableOptionModel<PawnContractAjtTypeModel>, 'count'>>;
    }): Either<Error, PawnContractAjtTableModel>;
    getSettlementTable(
        params: GetPawnContractSettlementTableParamsModel & {
            settlementOptions: Array<Omit<PawnContractTableOptionModel<PawnContractSettlementTypeModel>, 'count'>>;
        }
    ): Either<Error, PawnContractSettlementTableModel>;
    getRedeemedTable(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel>;
    getAuctionTable(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel>;
    getRefundTable(params: {
        summaries: PawnContractSummaryModel[];
    }): Either<Error, PawnContractSettlementTableModel>;
    getLocationTable(
        params: GetPawnContractLocationTableParamsModel & {
            locationOptions: Array<Omit<PawnContractTableOptionModel<PawnContractLocationTabModel>, 'count'>>;
        }
    ): Either<Error, PawnContractLocationTableModel>;
    getMaintenanceTable(
        params: GetPawnContractMaintenanceTableParamsModel
    ): Either<Error, PawnContractMaintenanceTableModel>;
    getIndexTabs(params: GetPawnContractIndexTabsParamsModel & {
        indexTabs: Array<Omit<PawnContractIndexTabModel, 'count'>>;
    }): Either<Error, PawnContractIndexTabModel[]>;
    runDefaultSeeder(): Promise<Either<Error, void>>;
    runSingleActiveSeeder(): Promise<Either<Error, void>>;
}
