export interface PawnContractHistoryMetaModel {
    label: string;
    value: string;
}

export interface PawnContractHistoryEntryModel {
    key: string;
    occurredAt: string | null;
    title: string;
    description: string;
    meta: PawnContractHistoryMetaModel[];
    sortValue: number;
}
