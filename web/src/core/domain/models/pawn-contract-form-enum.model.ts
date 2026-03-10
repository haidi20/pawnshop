export enum PawnContractFormModeEnum {
    Create = 'create',
    Edit = 'edit'
}

export enum PawnContractItemKindEnum {
    Electronic = 'electronic',
    Vehicle = 'vehicle'
}

export const pawnContractItemKindValues = [
    PawnContractItemKindEnum.Electronic,
    PawnContractItemKindEnum.Vehicle
] as const;

export enum PawnContractIdentityTypeEnum {
    Ktp = 'KTP',
    Sim = 'SIM',
    Kk = 'KK'
}

export const pawnContractIdentityTypeValues = [
    PawnContractIdentityTypeEnum.Ktp,
    PawnContractIdentityTypeEnum.Sim,
    PawnContractIdentityTypeEnum.Kk
] as const;

export enum PawnContractCustomerGenderEnum {
    Male = 'male',
    Female = 'female'
}

export enum PawnContractTermDaysEnum {
    Seven = 7,
    Fifteen = 15,
    Thirty = 30,
    Sixty = 60
}

export enum PawnContractPaymentOptionDaysEnum {
    Daily = 1,
    Weekly = 7,
    FifteenDays = 15
}
