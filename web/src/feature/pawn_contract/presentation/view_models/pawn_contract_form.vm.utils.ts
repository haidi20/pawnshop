import type { EnumOptionModel } from '@core/domain/models/enum-option.model';
import {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import { normalizePawnContractCustomerName } from '@core/util/pawn-contract-form';
import type {
    PawnContractCustomerLookupModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    PawnContractItemPresetModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';
import type {
    PawnContractConfirmationRowModel,
    PawnContractConfirmationSectionModel,
    PawnContractFinalConfirmationModel,
    PawnContractStepConfirmationModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_confirmation.model';
import type {
    PawnContractCustomerSuggestionOptionModel,
    PawnContractItemDetailPlaceholderModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

export const DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE = '2000-01-01';

export interface PawnContractRouteContextModel {
    mode: PawnContractFormModeEnum;
    contractId: number | null;
}

export interface PawnContractSummaryPresentationParams {
    form: PawnContractFormValueModel;
    selectedBranchName: string | null;
    selectedBranchAvailableBalance: number | null;
    maturityDate: string;
    currentPresetLabel: string | null;
    currentPresetDetailLabels: PawnContractItemPresetModel['detailLabels'] | null;
    selectedDetailOptionLabel: string | null;
    selectedDetailMarginRate: number | null;
    selectedDetailDeductionRate: number | null;
    selectedPaymentOptionLabel: string | null;
    selectedPaymentOptionHelper: string | null;
    storageFeeAmount: number;
    prepaidStorageAmount: number;
    prepaidStoragePeriodLabel: string;
    administrationFeeAmount: number;
    amountInWords: string;
    projectedRemainingBalance: number;
    formatCurrency: (value: number) => string;
    formatDate: (value: string) => string;
}

export interface PawnContractFinalConfirmationPresentationParams extends PawnContractSummaryPresentationParams {
    customerLookupMessage: string;
    customerGenderLabel: string;
    projectedRemainingBalance: number;
    hasEnoughBalance: boolean;
}

export const MAX_PAWN_CONTRACT_CUSTOMER_SUGGESTION_COUNT = 5;

export enum PawnContractCustomerLookupFieldEnum {
    FullName = 'fullName',
    PhoneNumber = 'phoneNumber',
    IdentityNumber = 'identityNumber'
}

export const escapeHtml = (value: string): string =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

export const createErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const createPawnContractRouteContext = (routeContractId: unknown): PawnContractRouteContextModel => {
    const rawValue = Array.isArray(routeContractId) ? routeContractId[0] : routeContractId;
    const contractId = typeof rawValue === 'string' ? Number(rawValue) : NaN;

    if (Number.isInteger(contractId) && contractId > 0) {
        return {
            mode: PawnContractFormModeEnum.Edit,
            contractId
        };
    }

    return {
        mode: PawnContractFormModeEnum.Create,
        contractId: null
    };
};

export const createDefaultPawnContractFormValue = (params: {
    referenceData: PawnContractFormReferenceModel;
    createCustomerLookupKey: () => string;
}): PawnContractFormValueModel => ({
    contractNumber: params.referenceData.nextContractNumber,
    branchId: params.referenceData.defaultBranchId ?? 0,
    contractDate: params.referenceData.defaultContractDate,
    termDays: params.referenceData.termOptions[0]?.value ?? PawnContractTermDaysEnum.Seven,
    itemName: '',
    itemKind: PawnContractItemKindEnum.Electronic,
    itemDetailType: params.referenceData.itemPresets[PawnContractItemKindEnum.Electronic].defaultDetailValue,
    itemDetailFirst: '',
    itemDetailSecond: '',
    itemDetailThird: '',
    accessorySummary: '',
    issueSummary: '',
    appraisedValue: 0,
    disbursedValue: 0,
    paymentOptionDays: params.referenceData.paymentOptions[0]?.value ?? PawnContractPaymentOptionDaysEnum.Daily,
    prepaidStoragePeriods: 0,
    customerLookupKey: params.createCustomerLookupKey(),
    customerFullName: '',
    customerGender: PawnContractCustomerGenderEnum.Male,
    customerAddress: '',
    customerCity: '',
    customerPhone: '',
    customerIdentityType: PawnContractIdentityTypeEnum.Ktp,
    customerIdentityNumber: '',
    customerBirthDate: DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE
});

export const createCustomerLookupFormPatch = (
    customer: PawnContractCustomerLookupModel
): Pick<
    PawnContractFormValueModel,
    | 'customerFullName'
    | 'customerGender'
    | 'customerAddress'
    | 'customerCity'
    | 'customerPhone'
    | 'customerIdentityType'
    | 'customerIdentityNumber'
    | 'customerBirthDate'
> => ({
    customerFullName: customer.fullName,
    customerGender: customer.gender,
    customerAddress: customer.address,
    customerCity: customer.city,
    customerPhone: customer.phoneNumber,
    customerIdentityType: customer.identityType ?? PawnContractIdentityTypeEnum.Ktp,
    customerIdentityNumber: customer.identityNumber ?? '',
    customerBirthDate: customer.birthDate ?? DEFAULT_PAWN_CONTRACT_CUSTOMER_BIRTH_DATE
});

const normalizePawnContractCustomerPhone = (value: string): string => value.replace(/\D+/g, '');

const normalizePawnContractCustomerIdentityNumber = (value: string): string =>
    value.replace(/[^0-9a-z]+/gi, '').trim().toLowerCase();

const normalizePawnContractCustomerLookupValue = (
    field: PawnContractCustomerLookupFieldEnum,
    value: string | null
): string => {
    const safeValue = value ?? '';

    switch (field) {
        case PawnContractCustomerLookupFieldEnum.FullName:
            return normalizePawnContractCustomerName(safeValue);
        case PawnContractCustomerLookupFieldEnum.PhoneNumber:
            return normalizePawnContractCustomerPhone(safeValue);
        case PawnContractCustomerLookupFieldEnum.IdentityNumber:
            return normalizePawnContractCustomerIdentityNumber(safeValue);
    }
};

const getPawnContractCustomerLookupFieldValue = (
    customer: PawnContractCustomerLookupModel,
    field: PawnContractCustomerLookupFieldEnum
): string | null => {
    switch (field) {
        case PawnContractCustomerLookupFieldEnum.FullName:
            return customer.fullName;
        case PawnContractCustomerLookupFieldEnum.PhoneNumber:
            return customer.phoneNumber;
        case PawnContractCustomerLookupFieldEnum.IdentityNumber:
            return customer.identityNumber;
    }
};

const buildPawnContractCustomerSuggestionLabel = (
    customer: PawnContractCustomerLookupModel,
    field: PawnContractCustomerLookupFieldEnum
): string => {
    switch (field) {
        case PawnContractCustomerLookupFieldEnum.FullName:
            return `${customer.customerCode} | ${customer.phoneNumber || '-'} | ${customer.identityNumber ?? '-'}`;
        case PawnContractCustomerLookupFieldEnum.PhoneNumber:
            return `${customer.fullName} | ${customer.identityNumber ?? '-'} | ${customer.customerCode}`;
        case PawnContractCustomerLookupFieldEnum.IdentityNumber:
            return `${customer.fullName} | ${customer.phoneNumber || '-'} | ${customer.customerCode}`;
    }
};

const comparePawnContractCustomerSuggestions = (
    left: PawnContractCustomerLookupModel,
    right: PawnContractCustomerLookupModel,
    field: PawnContractCustomerLookupFieldEnum,
    normalizedKeyword: string
): number => {
    const leftValue = normalizePawnContractCustomerLookupValue(field, getPawnContractCustomerLookupFieldValue(left, field));
    const rightValue = normalizePawnContractCustomerLookupValue(field, getPawnContractCustomerLookupFieldValue(right, field));
    const leftScore = leftValue === normalizedKeyword ? 0 : leftValue.startsWith(normalizedKeyword) ? 1 : 2;
    const rightScore = rightValue === normalizedKeyword ? 0 : rightValue.startsWith(normalizedKeyword) ? 1 : 2;

    if (leftScore !== rightScore) {
        return leftScore - rightScore;
    }

    return left.fullName.localeCompare(right.fullName, 'id-ID');
};

export const findMatchedPawnContractCustomer = (params: {
    customers: PawnContractCustomerLookupModel[];
    keyword: string;
    field: PawnContractCustomerLookupFieldEnum;
}): PawnContractCustomerLookupModel | null => {
    const normalizedKeyword = normalizePawnContractCustomerLookupValue(params.field, params.keyword);
    if (!normalizedKeyword) {
        return null;
    }

    return (
        params.customers.find(
            (customer) =>
                normalizePawnContractCustomerLookupValue(
                    params.field,
                    getPawnContractCustomerLookupFieldValue(customer, params.field)
                ) === normalizedKeyword
        ) ?? null
    );
};

export const buildPawnContractCustomerSuggestions = (params: {
    customers: PawnContractCustomerLookupModel[];
    keyword: string;
    field: PawnContractCustomerLookupFieldEnum;
    limit?: number;
}): PawnContractCustomerSuggestionOptionModel[] => {
    const normalizedKeyword = normalizePawnContractCustomerLookupValue(params.field, params.keyword);
    if (!normalizedKeyword) {
        return [];
    }

    return params.customers
        .filter((customer) =>
            normalizePawnContractCustomerLookupValue(
                params.field,
                getPawnContractCustomerLookupFieldValue(customer, params.field)
            ).includes(normalizedKeyword)
        )
        .sort((left, right) => comparePawnContractCustomerSuggestions(left, right, params.field, normalizedKeyword))
        .slice(0, params.limit ?? MAX_PAWN_CONTRACT_CUSTOMER_SUGGESTION_COUNT)
        .map((customer) => ({
            key: `${params.field}-${customer.id}`,
            value: getPawnContractCustomerLookupFieldValue(customer, params.field) ?? '',
            label: buildPawnContractCustomerSuggestionLabel(customer, params.field)
        }));
};

export const createPawnContractItemDetailPlaceholders = (params: {
    itemKind: PawnContractItemKindEnum;
    itemDetailType: string;
    detailLabels: PawnContractItemPresetModel['detailLabels'] | null;
}): PawnContractItemDetailPlaceholderModel => {
    const matchedPlaceholder =
        pawnContractItemDetailPlaceholderMap[params.itemKind][params.itemDetailType] ??
        Object.values(pawnContractItemDetailPlaceholderMap[params.itemKind])[0] ??
        null;

    if (matchedPlaceholder) {
        return matchedPlaceholder;
    }

    return {
        first: `Contoh: ${params.detailLabels?.first ?? 'Isi detail pertama'}`,
        second: `Contoh: ${params.detailLabels?.second ?? 'Isi detail kedua'}`,
        third: `Contoh: ${params.detailLabels?.third ?? 'Isi detail ketiga'}`
    };
};

const createConfirmationRow = (
    key: string,
    label: string,
    value: string,
    helper?: string
): PawnContractConfirmationRowModel => ({
    key,
    label,
    value: value.trim() || '-',
    helper
});

const createConfirmationSection = (
    id: string,
    kicker: string,
    title: string,
    description: string,
    iconClass: string,
    rows: PawnContractConfirmationRowModel[]
): PawnContractConfirmationSectionModel => ({
    id,
    kicker,
    title,
    description,
    iconClass,
    rows
});

const formatPawnContractPaymentOptionLabel = (label: string | null, days: number): string =>
    label ?? `Per ${days} hari`;

const pawnContractItemDetailPlaceholderMap: Record<
    PawnContractItemKindEnum,
    Record<string, PawnContractItemDetailPlaceholderModel>
> = {
    [PawnContractItemKindEnum.Electronic]: {
        smartphone: {
            first: 'Contoh: iPhone 13 Pro 128GB',
            second: 'Contoh: Apple',
            third: 'Contoh: 356789012345678'
        },
        laptop: {
            first: 'Contoh: ThinkPad X1 Carbon Gen 11',
            second: 'Contoh: Lenovo',
            third: 'Contoh: PF-3A1B9C'
        },
        kamera: {
            first: 'Contoh: EOS R50 Kit 18-45mm',
            second: 'Contoh: Canon',
            third: 'Contoh: 1420034589'
        },
        tv: {
            first: 'Contoh: UHD 50AU7000 50 inci',
            second: 'Contoh: Samsung',
            third: 'Contoh: SN-TV-2026-001'
        },
        lain_lain: {
            first: 'Contoh: Speaker aktif 12 inci',
            second: 'Contoh: Polytron',
            third: 'Contoh: SN-ELEC-99881'
        }
    },
    [PawnContractItemKindEnum.Vehicle]: {
        motor: {
            first: 'Contoh: DD 1234 XY',
            second: 'Contoh: Hitam doff',
            third: 'Contoh: MH1JB1234NK567890'
        },
        mobil: {
            first: 'Contoh: DD 1881 AB',
            second: 'Contoh: Putih mutiara',
            third: 'Contoh: MHK2GB123LJ456789'
        }
    }
};

export const buildStepOneValidationErrors = (params: {
    form: PawnContractFormValueModel;
    currentPreset: PawnContractItemPresetModel | null;
    selectedBranchAvailableBalance: number | null;
}): string[] => {
    const { form, currentPreset, selectedBranchAvailableBalance } = params;
    const errors: string[] = [];

    if (form.branchId <= 0) {
        errors.push('Cabang aktif perlu dipilih.');
    }

    if (!form.contractDate) {
        errors.push('Tanggal mulai gadai wajib diisi.');
    }

    if (!form.itemName.trim()) {
        errors.push('Nama barang jaminan belum diisi.');
    }

    if (!form.itemDetailType) {
        errors.push('Jenis detail barang belum dipilih.');
    }

    if (!form.itemDetailFirst.trim()) {
        errors.push(`${currentPreset?.detailLabels.first ?? 'Detail pertama'} wajib diisi.`);
    }

    if (!form.itemDetailSecond.trim()) {
        errors.push(`${currentPreset?.detailLabels.second ?? 'Detail kedua'} wajib diisi.`);
    }

    if (!form.itemDetailThird.trim()) {
        errors.push(`${currentPreset?.detailLabels.third ?? 'Detail ketiga'} wajib diisi.`);
    }

    if (!form.accessorySummary.trim()) {
        errors.push('Kelengkapan barang wajib dijelaskan.');
    }

    if (!form.issueSummary.trim()) {
        errors.push('Catatan kekurangan atau kerusakan wajib diisi.');
    }

    if (form.appraisedValue <= 0) {
        errors.push('Nilai taksiran harus lebih besar dari nol.');
    }

    if (form.disbursedValue <= 0) {
        errors.push('Dana pencairan harus lebih besar dari nol.');
    }

    if (form.disbursedValue > form.appraisedValue) {
        errors.push('Dana pencairan tidak boleh lebih dari nilai taksir.');
    }

    if (selectedBranchAvailableBalance !== null && form.disbursedValue > selectedBranchAvailableBalance) {
        errors.push('Dana pencairan melebihi saldo cabang aktif.');
    }

    return errors;
};

export const buildStepTwoValidationErrors = (form: PawnContractFormValueModel): string[] => {
    const errors: string[] = [];

    if (!form.customerFullName.trim()) {
        errors.push('Nama lengkap nasabah wajib diisi.');
    }

    if (!form.customerAddress.trim()) {
        errors.push('Alamat lengkap nasabah wajib diisi.');
    }

    if (!form.customerCity.trim()) {
        errors.push('Kota atau kabupaten wajib diisi.');
    }

    if (!form.customerPhone.trim()) {
        errors.push('Nomor telepon nasabah wajib diisi.');
    }

    if (!form.customerIdentityType) {
        errors.push('Jenis identitas belum dipilih.');
    }

    if (!form.customerIdentityNumber.trim()) {
        errors.push('Nomor identitas wajib diisi.');
    }

    return errors;
};

export const buildSavePawnContractPayload = (params: {
    contractId: number | null;
    form: PawnContractFormValueModel;
    maturityDate: string;
    storageFeeAmount: number;
    prepaidStorageAmount: number;
    prepaidStoragePeriodLabel: string;
    administrationFeeAmount: number;
    amountInWords: string;
}): SavePawnContractPayloadModel => ({
    contractId: params.contractId,
    contractNumber: params.form.contractNumber,
    branchId: params.form.branchId,
    contractDate: params.form.contractDate,
    maturityDate: params.maturityDate,
    termDays: params.form.termDays,
    itemName: params.form.itemName.trim(),
    itemKind: params.form.itemKind,
    itemDetailType: params.form.itemDetailType,
    itemDetailFirst: params.form.itemDetailFirst.trim(),
    itemDetailSecond: params.form.itemDetailSecond.trim(),
    itemDetailThird: params.form.itemDetailThird.trim(),
    accessorySummary: params.form.accessorySummary.trim(),
    issueSummary: params.form.issueSummary.trim(),
    appraisedValue: params.form.appraisedValue,
    disbursedValue: params.form.disbursedValue,
    paymentOptionDays: params.form.paymentOptionDays,
    storageFeeAmount: params.storageFeeAmount,
    prepaidStoragePeriods: params.form.prepaidStoragePeriods,
    prepaidStorageAmount: params.prepaidStorageAmount,
    prepaidStoragePeriodLabel: params.prepaidStoragePeriodLabel,
    administrationFeeAmount: params.administrationFeeAmount,
    amountInWords: params.amountInWords,
    customerLookupKey: params.form.customerLookupKey,
    customerFullName: params.form.customerFullName.trim(),
    customerGender: params.form.customerGender,
    customerAddress: params.form.customerAddress.trim(),
    customerCity: params.form.customerCity.trim(),
    customerPhone: params.form.customerPhone.trim(),
    customerIdentityType: params.form.customerIdentityType,
    customerIdentityNumber: params.form.customerIdentityNumber.trim(),
    customerBirthDate: params.form.customerBirthDate || null
});

export const buildPawnContractSummaryConfirmation = (
    params: PawnContractSummaryPresentationParams
): PawnContractStepConfirmationModel => {
    return {
        sections: [
            createConfirmationSection(
                'contract',
                'Informasi gadai',
                'Data kontrak dan waktu',
                'Pastikan nomor, cabang, dan periode gadai sudah sesuai sebelum melanjutkan.',
                'bi bi-receipt-cutoff',
                [
                    createConfirmationRow('contract-number', 'Nomor gadai', params.form.contractNumber),
                    createConfirmationRow('branch', 'Cabang aktif', params.selectedBranchName ?? '-'),
                    createConfirmationRow(
                        'branch-available-balance',
                        'Saldo cabang terpilih',
                        params.selectedBranchAvailableBalance !== null
                            ? params.formatCurrency(params.selectedBranchAvailableBalance)
                            : '-'
                    ),
                    createConfirmationRow('contract-date', 'Tanggal mulai gadai', params.formatDate(params.form.contractDate)),
                    createConfirmationRow('term-days', 'Durasi gadai', `${params.form.termDays} hari`),
                    createConfirmationRow('maturity-date', 'Jatuh tempo', params.formatDate(params.maturityDate))
                ]
            ),
            createConfirmationSection(
                'item',
                'Barang jaminan',
                'Profil barang yang disimpan',
                'Semua identitas barang, kelengkapan, dan catatan kondisi ditampilkan agar mudah dicek ulang.',
                'bi bi-box-seam',
                [
                    createConfirmationRow('item-name', 'Nama barang', params.form.itemName),
                    createConfirmationRow('item-kind', 'Kelompok barang', params.currentPresetLabel ?? '-'),
                    createConfirmationRow(
                        'item-detail-type',
                        'Jenis detail',
                        params.selectedDetailOptionLabel ?? '-',
                        `Margin ${params.selectedDetailMarginRate ?? 0}% | Potongan ${params.selectedDetailDeductionRate ?? 0}%`
                    ),
                    createConfirmationRow(
                        'item-detail-first',
                        params.currentPresetDetailLabels?.first ?? 'Detail pertama',
                        params.form.itemDetailFirst
                    ),
                    createConfirmationRow(
                        'item-detail-second',
                        params.currentPresetDetailLabels?.second ?? 'Detail kedua',
                        params.form.itemDetailSecond
                    ),
                    createConfirmationRow(
                        'item-detail-third',
                        params.currentPresetDetailLabels?.third ?? 'Detail ketiga',
                        params.form.itemDetailThird
                    ),
                    createConfirmationRow('accessory-summary', 'Kelengkapan barang', params.form.accessorySummary),
                    createConfirmationRow('issue-summary', 'Catatan kekurangan', params.form.issueSummary)
                ]
            ),
            createConfirmationSection(
                'finance',
                'Nilai dan biaya',
                'Rincian hitungan pencairan',
                'Nominal, skema biaya, dan total titip di muka dirangkum agar petugas tidak perlu bolak-balik ke form.',
                'bi bi-cash-coin',
                [
                    createConfirmationRow('appraised-value', 'Nilai taksiran', params.formatCurrency(params.form.appraisedValue)),
                    createConfirmationRow('disbursed-value', 'Dana pencairan', params.formatCurrency(params.form.disbursedValue)),
                    createConfirmationRow('amount-in-words', 'Terbilang', params.amountInWords),
                    createConfirmationRow(
                        'payment-option',
                        'Skema biaya titip',
                        formatPawnContractPaymentOptionLabel(params.selectedPaymentOptionLabel, params.form.paymentOptionDays),
                        params.selectedPaymentOptionHelper ?? undefined
                    ),
                    createConfirmationRow('storage-fee-amount', 'Biaya titip per periode', params.formatCurrency(params.storageFeeAmount)),
                    createConfirmationRow(
                        'prepaid-storage-periods',
                        'Titip dibayar di muka',
                        `${params.form.prepaidStoragePeriods} periode (${params.prepaidStoragePeriodLabel})`
                    ),
                    createConfirmationRow(
                        'prepaid-storage-amount',
                        'Total biaya titip di muka',
                        params.formatCurrency(params.prepaidStorageAmount)
                    ),
                    createConfirmationRow(
                        'administration-fee',
                        'Biaya admin',
                        params.formatCurrency(params.administrationFeeAmount)
                    ),
                    createConfirmationRow(
                        'projected-remaining-balance',
                        'Sisa saldo cabang setelah pencairan',
                        params.formatCurrency(params.projectedRemainingBalance)
                    )
                ]
            )
        ]
    };
};

export const buildPawnContractFinalConfirmation = (
    params: PawnContractFinalConfirmationPresentationParams
): PawnContractFinalConfirmationModel => {
    return {
        sections: [
            ...buildPawnContractSummaryConfirmation(params).sections,
            createConfirmationSection(
                'customer',
                'Data nasabah',
                'Identitas yang akan dipakai',
                params.customerLookupMessage,
                'bi bi-person-vcard',
                [
                    createConfirmationRow('customer-full-name', 'Nama lengkap', params.form.customerFullName),
                    createConfirmationRow('customer-gender', 'Jenis kelamin', params.customerGenderLabel),
                    createConfirmationRow(
                        'customer-birth-date',
                        'Tanggal lahir',
                        params.form.customerBirthDate ? params.formatDate(params.form.customerBirthDate) : '-'
                    ),
                    createConfirmationRow('customer-address', 'Alamat lengkap', params.form.customerAddress),
                    createConfirmationRow('customer-city', 'Kota / kabupaten', params.form.customerCity),
                    createConfirmationRow('customer-phone', 'Nomor telepon', params.form.customerPhone),
                    createConfirmationRow('customer-identity-type', 'Jenis identitas', params.form.customerIdentityType),
                    createConfirmationRow('customer-identity-number', 'Nomor identitas', params.form.customerIdentityNumber)
                ]
            )
        ],
        statusLabel: params.hasEnoughBalance ? 'Siap diproses' : 'Perlu penyesuaian',
        balanceMessage: params.hasEnoughBalance
            ? `Total saldo setelah gadai ini diperkirakan menjadi ${params.formatCurrency(params.projectedRemainingBalance)}.`
            : 'Dana pencairan melebihi saldo cabang aktif. Kurangi pencairan atau pilih cabang lain.',
        hasEnoughBalance: params.hasEnoughBalance
    };
};

export const resolveValidPaymentOptionDays = (params: {
    availableOptions: Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>>;
    currentValue: PawnContractPaymentOptionDaysEnum;
}): PawnContractPaymentOptionDaysEnum =>
    params.availableOptions.find((option) => option.value === params.currentValue)?.value ??
    params.availableOptions[0]?.value ??
    PawnContractPaymentOptionDaysEnum.Daily;

export const resolveValidPrepaidStoragePeriods = (params: {
    availableOptions: number[];
    currentValue: number;
}): number => (params.availableOptions.includes(params.currentValue) ? params.currentValue : 0);

export const resolveValidItemDetailType = (params: {
    currentPreset: PawnContractItemPresetModel | null;
    currentValue: string;
}): string => {
    if (
        params.currentPreset?.detailOptions.some((option) => option.value === params.currentValue) &&
        params.currentValue
    ) {
        return params.currentValue;
    }

    return params.currentPreset?.defaultDetailValue ?? '';
};

export const buildSaveSuccessMessage = (params: {
    isEditMode: boolean;
    result: SavePawnContractResultModel;
}): { title: string; message: string } => {
    if (params.isEditMode) {
        return {
            title: 'Perubahan data gadai berhasil disimpan',
            message: `Perubahan untuk nomor gadai ${params.result.contractNumber} sudah tersimpan.`
        };
    }

    return {
        title: 'Data gadai baru berhasil disimpan',
        message: `${params.result.usedExistingCustomer ? 'Nasabah lama dipakai kembali.' : 'Nasabah baru berhasil dibuat.'} Nomor gadai ${params.result.contractNumber} siap dilihat di daftar data gadai.`
    };
};

export const buildSaveFailureMessage = (params: {
    isEditMode: boolean;
    error: unknown;
}): { rawMessage: string; title: string; message: string } => {
    const rawMessage = createErrorMessage(params.error);

    return {
        rawMessage,
        title: 'Data gadai belum tersimpan',
        message:
            params.error instanceof Error
                ? params.error.message
                : params.isEditMode
                  ? 'Terjadi kendala saat menyimpan perubahan data gadai.'
                  : 'Terjadi kendala saat menyimpan data gadai baru.'
    };
};
