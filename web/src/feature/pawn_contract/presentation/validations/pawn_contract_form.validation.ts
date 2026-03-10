import { z } from 'zod';

import {
    PawnContractCustomerGenderEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import type {
    PawnContractFormValueModel,
    PawnContractItemPresetModel,
    SavePawnContractPayloadModel
} from '@feature/pawn_contract/domain/models';
import type { PawnContractFormFieldName } from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

export interface PawnContractFieldValidationParams {
    form: PawnContractFormValueModel;
    currentPreset: PawnContractItemPresetModel | null;
    selectedBranchAvailableBalance: number | null;
}

export interface PawnContractFormValidationResult {
    fieldErrors: Partial<Record<PawnContractFormFieldName, string>>;
    messages: string[];
}

const pawnContractTermDaysSchema = z.enum(PawnContractTermDaysEnum);
const pawnContractItemKindSchema = z.enum(PawnContractItemKindEnum);
const pawnContractPaymentOptionDaysSchema = z.enum(PawnContractPaymentOptionDaysEnum);
const pawnContractCustomerGenderSchema = z.enum(PawnContractCustomerGenderEnum);
const pawnContractIdentityTypeSchema = z.enum(PawnContractIdentityTypeEnum);

const createPawnContractFormSchema = (params: PawnContractFieldValidationParams) =>
    z
        .object({
            contractNumber: z.string(),
            branchId: z.number().int().min(1, 'Cabang aktif perlu dipilih.'),
            contractDate: z.string().trim().min(1, 'Tanggal mulai gadai wajib diisi.'),
            termDays: pawnContractTermDaysSchema,
            itemName: z.string().trim().min(1, 'Nama barang jaminan belum diisi.'),
            itemKind: pawnContractItemKindSchema,
            itemDetailType: z.string().trim().min(1, 'Jenis detail barang belum dipilih.'),
            itemDetailFirst: z
                .string()
                .trim()
                .min(1, `${params.currentPreset?.detailLabels.first ?? 'Detail pertama'} wajib diisi.`),
            itemDetailSecond: z
                .string()
                .trim()
                .min(1, `${params.currentPreset?.detailLabels.second ?? 'Detail kedua'} wajib diisi.`),
            itemDetailThird: z
                .string()
                .trim()
                .min(1, `${params.currentPreset?.detailLabels.third ?? 'Detail ketiga'} wajib diisi.`),
            accessorySummary: z.string().trim().min(1, 'Kelengkapan barang wajib dijelaskan.'),
            issueSummary: z.string().trim().min(1, 'Catatan kekurangan atau kerusakan wajib diisi.'),
            appraisedValue: z.number().gt(0, 'Nilai taksiran harus lebih besar dari nol.'),
            disbursedValue: z.number().gt(0, 'Dana pencairan harus lebih besar dari nol.'),
            paymentOptionDays: pawnContractPaymentOptionDaysSchema,
            prepaidStoragePeriods: z.number().int().min(0),
            customerLookupKey: z.string(),
            customerFullName: z.string().trim().min(1, 'Nama lengkap nasabah wajib diisi.'),
            customerGender: pawnContractCustomerGenderSchema,
            customerAddress: z.string().trim().min(1, 'Alamat lengkap nasabah wajib diisi.'),
            customerCity: z.string().trim().min(1, 'Kota atau kabupaten wajib diisi.'),
            customerPhone: z.string().trim().min(1, 'Nomor telepon nasabah wajib diisi.'),
            customerIdentityType: pawnContractIdentityTypeSchema,
            customerIdentityNumber: z.string().trim().min(1, 'Nomor identitas wajib diisi.'),
            customerBirthDate: z.string()
        })
        .superRefine((value, context) => {
            if (value.disbursedValue > value.appraisedValue) {
                context.addIssue({
                    code: 'custom',
                    path: ['disbursedValue'],
                    message: 'Dana pencairan tidak boleh lebih dari nilai taksir.'
                });
            }

            if (
                params.selectedBranchAvailableBalance !== null &&
                value.disbursedValue > params.selectedBranchAvailableBalance
            ) {
                context.addIssue({
                    code: 'custom',
                    path: ['disbursedValue'],
                    message: 'Dana pencairan melebihi saldo cabang aktif.'
                });
            }
        });

const createPawnContractSavePayloadSchema = (params: { selectedBranchAvailableBalance: number | null }) =>
    z
        .object({
            contractId: z.number().int().positive().nullable(),
            contractNumber: z.string().trim().min(1, 'Nomor gadai wajib tersedia.'),
            branchId: z.number().int().min(1, 'Cabang aktif perlu dipilih.'),
            contractDate: z.string().trim().min(1, 'Tanggal mulai gadai wajib diisi.'),
            maturityDate: z.string().trim().min(1, 'Tanggal jatuh tempo wajib tersedia.'),
            termDays: pawnContractTermDaysSchema,
            itemName: z.string().trim().min(1, 'Nama barang jaminan belum diisi.'),
            itemKind: pawnContractItemKindSchema,
            itemDetailType: z.string().trim().min(1, 'Jenis detail barang belum dipilih.'),
            itemDetailFirst: z.string().trim().min(1, 'Detail pertama wajib diisi.'),
            itemDetailSecond: z.string().trim().min(1, 'Detail kedua wajib diisi.'),
            itemDetailThird: z.string().trim().min(1, 'Detail ketiga wajib diisi.'),
            accessorySummary: z.string().trim().min(1, 'Kelengkapan barang wajib dijelaskan.'),
            issueSummary: z.string().trim().min(1, 'Catatan kekurangan atau kerusakan wajib diisi.'),
            appraisedValue: z.number().gt(0, 'Nilai taksiran harus lebih besar dari nol.'),
            disbursedValue: z.number().gt(0, 'Dana pencairan harus lebih besar dari nol.'),
            paymentOptionDays: pawnContractPaymentOptionDaysSchema,
            storageFeeAmount: z.number().min(0),
            prepaidStoragePeriods: z.number().int().min(0),
            prepaidStorageAmount: z.number().min(0),
            prepaidStoragePeriodLabel: z.string(),
            administrationFeeAmount: z.number().min(0),
            amountInWords: z.string().trim().min(1, 'Nilai terbilang wajib tersedia.'),
            customerLookupKey: z.string().trim().min(1),
            customerFullName: z.string().trim().min(1, 'Nama lengkap nasabah wajib diisi.'),
            customerGender: pawnContractCustomerGenderSchema,
            customerAddress: z.string().trim().min(1, 'Alamat lengkap nasabah wajib diisi.'),
            customerCity: z.string().trim().min(1, 'Kota atau kabupaten wajib diisi.'),
            customerPhone: z.string().trim().min(1, 'Nomor telepon nasabah wajib diisi.'),
            customerIdentityType: pawnContractIdentityTypeSchema,
            customerIdentityNumber: z.string().trim().min(1, 'Nomor identitas wajib diisi.'),
            customerBirthDate: z.string().nullable()
        })
        .superRefine((value, context) => {
            if (value.disbursedValue > value.appraisedValue) {
                context.addIssue({
                    code: 'custom',
                    path: ['disbursedValue'],
                    message: 'Dana pencairan tidak boleh lebih dari nilai taksir.'
                });
            }

            if (
                params.selectedBranchAvailableBalance !== null &&
                value.disbursedValue > params.selectedBranchAvailableBalance
            ) {
                context.addIssue({
                    code: 'custom',
                    path: ['disbursedValue'],
                    message: 'Dana pencairan melebihi saldo cabang aktif.'
                });
            }
        });

const createPawnContractValidationResult = (
    issues: Array<{ path: PropertyKey[]; message: string }>
): PawnContractFormValidationResult => {
    const fieldErrors: Partial<Record<PawnContractFormFieldName, string>> = {};
    const messages: string[] = [];

    for (const issue of issues) {
        const field = issue.path[0];

        if (typeof field === 'string' && !(field in fieldErrors)) {
            fieldErrors[field as PawnContractFormFieldName] = issue.message;
        }

        if (!messages.includes(issue.message)) {
            messages.push(issue.message);
        }
    }

    return {
        fieldErrors,
        messages
    };
};

export const validatePawnContractForm = (params: PawnContractFieldValidationParams): PawnContractFormValidationResult => {
    const validation = createPawnContractFormSchema(params).safeParse(params.form);

    if (validation.success) {
        return {
            fieldErrors: {},
            messages: []
        };
    }

    return createPawnContractValidationResult(validation.error.issues);
};

export const validatePawnContractSavePayload = (params: {
    payload: SavePawnContractPayloadModel;
    selectedBranchAvailableBalance: number | null;
}): string[] => {
    const validation = createPawnContractSavePayloadSchema({
        selectedBranchAvailableBalance: params.selectedBranchAvailableBalance
    }).safeParse(params.payload);

    if (validation.success) {
        return [];
    }

    return createPawnContractValidationResult(validation.error.issues).messages;
};
