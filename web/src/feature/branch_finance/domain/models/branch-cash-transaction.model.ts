import type { EnumOptionModel } from '@core/domain/models/enum-option.model';

export type BranchCashTransactionEntryDirectionModel =
    'debit' |
    'credit';

export const branchCashTransactionEntryDirectionLabelMap: Record<BranchCashTransactionEntryDirectionModel, string> = {
    'debit': 'Debit',
    'credit': 'Kredit',
};

export const branchCashTransactionEntryDirectionOptions: EnumOptionModel<BranchCashTransactionEntryDirectionModel>[] = [
    { value: 'debit', label: branchCashTransactionEntryDirectionLabelMap['debit'] },
    { value: 'credit', label: branchCashTransactionEntryDirectionLabelMap['credit'] },
];

export interface BranchCashTransactionModel {
    id: number;
    branchId: number;
    cashAccountId: number | null;
    transactionTypeCode: string;
    referenceTable: string | null;
    referenceId: number | null;
    entryDirection: BranchCashTransactionEntryDirectionModel;
    amount: number;
    transactionDate: string;
    description: string | null;
    createdByUserId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
