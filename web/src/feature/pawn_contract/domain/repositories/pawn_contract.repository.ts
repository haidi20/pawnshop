import type {
    PawnContractDataModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';

export interface PawnContractRepository {
    getData(): Promise<PawnContractDataModel>;
    getFormReferenceData(): Promise<PawnContractFormReferenceModel>;
    getFormValue(contractId: number): Promise<PawnContractFormValueModel>;
    saveContract(payload: SavePawnContractPayloadModel): Promise<SavePawnContractResultModel>;
}
