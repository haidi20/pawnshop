import type { PawnContractStatusModel } from '@core/util/helpers';

export {
    pawnContractStatusLabelMap,
    pawnContractStatusOptions,
    type PawnContractStatusModel
} from '@core/util/helpers';

export interface PawnContractModel {
    id: number;
    contractNumber: string;
    branchId: number;
    customerId: number;
    contractDate: string;
    maturityDate: string;
    termDays: number;
    appraisedValue: number;
    disbursedValue: number;
    storageFeeAmount: number;
    administrationFeeAmount: number;
    paymentOptionDays: number | null;
    amountInWords: string | null;
    contractStatus: PawnContractStatusModel;
    maintenanceRequired: boolean;
    maintenanceReport: string | null;
    notes: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
