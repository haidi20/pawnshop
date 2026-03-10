export interface PawnContractConfirmationRowModel {
    key: string;
    label: string;
    value: string;
    helper?: string;
}

export interface PawnContractConfirmationSectionModel {
    id: string;
    kicker: string;
    title: string;
    description: string;
    iconClass: string;
    rows: PawnContractConfirmationRowModel[];
}

export interface PawnContractStepConfirmationModel {
    sections: PawnContractConfirmationSectionModel[];
}

export interface PawnContractFinalConfirmationModel {
    sections: PawnContractConfirmationSectionModel[];
    statusLabel: string;
    balanceMessage: string;
    hasEnoughBalance: boolean;
}
