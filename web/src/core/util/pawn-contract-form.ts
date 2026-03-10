import type { EnumOptionModel } from '@core/domain/models/enum-option.model';
import {
    PawnContractIdentityTypeEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';

export const pawnContractTermOptions: Array<EnumOptionModel<PawnContractTermDaysEnum>> = [
    { value: PawnContractTermDaysEnum.Seven, label: '7 hari', helper: 'Cocok untuk gadai singkat.' },
    { value: PawnContractTermDaysEnum.Fifteen, label: '15 hari', helper: 'Pilihan menengah untuk kebutuhan cepat.' },
    { value: PawnContractTermDaysEnum.Thirty, label: '30 hari', helper: 'Pilihan paling umum untuk gadai baru.' },
    { value: PawnContractTermDaysEnum.Sixty, label: '60 hari', helper: 'Dipakai untuk tenor lebih panjang.' }
];

export const pawnContractPaymentOptions: Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>> = [
    { value: PawnContractPaymentOptionDaysEnum.Daily, label: 'Harian', helper: 'Biaya titip dihitung per hari.' },
    { value: PawnContractPaymentOptionDaysEnum.Weekly, label: 'Per 7 hari', helper: 'Biaya titip dihitung per minggu.' },
    {
        value: PawnContractPaymentOptionDaysEnum.FifteenDays,
        label: 'Per 15 hari',
        helper: 'Biaya titip dihitung per 15 hari.'
    }
];

export const pawnContractIdentityOptions: Array<EnumOptionModel<PawnContractIdentityTypeEnum>> = [
    { value: PawnContractIdentityTypeEnum.Ktp, label: 'KTP' },
    { value: PawnContractIdentityTypeEnum.Sim, label: 'SIM' },
    { value: PawnContractIdentityTypeEnum.Kk, label: 'KK' }
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
});

const normalizeDateInput = (value: string): string => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
};

export const getTodayDateValue = (): string => new Date().toISOString().slice(0, 10);

export const calculatePawnContractMaturityDate = (contractDate: string, termDays: number): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(contractDate)) {
        return getTodayDateValue();
    }

    const [year, month, day] = contractDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + termDays);
    return date.toISOString().slice(0, 10);
};

export const formatDateForHumans = (value: string): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return '-';
    }

    return dateFormatter.format(new Date(`${value}T00:00:00`));
};

export const formatCurrencyForHumans = (value: number): string => currencyFormatter.format(value);

export const getAvailablePawnContractPaymentOptions = (
    termDays: number
): Array<EnumOptionModel<PawnContractPaymentOptionDaysEnum>> =>
    pawnContractPaymentOptions.filter(
        (option) => !(termDays === PawnContractTermDaysEnum.Seven && option.value === PawnContractPaymentOptionDaysEnum.FifteenDays)
    );

export const getPawnContractPrepaidStorageMax = (termDays: number, paymentOptionDays: number): number => {
    if (termDays === PawnContractTermDaysEnum.Seven) {
        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily ? 7 : 1;
    }

    if (termDays === PawnContractTermDaysEnum.Fifteen) {
        if (paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
            return 15;
        }

        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly ? 2 : 1;
    }

    if (termDays === PawnContractTermDaysEnum.Thirty) {
        if (paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
            return 15;
        }

        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly ? 4 : 2;
    }

    if (termDays === PawnContractTermDaysEnum.Sixty) {
        if (paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
            return 15;
        }

        return paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly ? 9 : 4;
    }

    return 0;
};

export const getPawnContractPrepaidStorageOptions = (termDays: number, paymentOptionDays: number): number[] => {
    const max = getPawnContractPrepaidStorageMax(termDays, paymentOptionDays);
    return Array.from({ length: max + 1 }, (_, index) => index);
};

export const calculatePawnContractStorageFee = (params: {
    disbursedValue: number;
    marginRate: number;
    deductionRate: number;
    paymentOptionDays: number;
}): number => {
    if (params.disbursedValue <= 0) {
        return 0;
    }

    const grossAmount = params.disbursedValue * (params.marginRate / 100);
    const deductionAmount = params.disbursedValue * (params.deductionRate / 100);
    const baseAmount = grossAmount - deductionAmount;

    let nextValue = 0;
    if (params.paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily) {
        nextValue = baseAmount / 2 / 7;
    } else if (params.paymentOptionDays === PawnContractPaymentOptionDaysEnum.Weekly) {
        nextValue = baseAmount / 2;
    } else {
        nextValue = baseAmount;
    }

    const safeValue = Math.max(0, nextValue);
    if (safeValue >= 1000) {
        return Math.round(safeValue / 1000) * 1000;
    }

    return Math.round(safeValue);
};

export const calculatePawnContractPrepaidStorageAmount = (storageFeeAmount: number, periods: number): number =>
    Math.max(0, storageFeeAmount * periods);

export const buildPawnContractPrepaidStorageLabel = (periods: number): string =>
    periods >= 1 ? `0 - ${periods}` : '-';

const indonesianWords = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas'
];

const spellIndonesianNumber = (value: number): string => {
    if (value < 12) {
        return indonesianWords[value];
    }

    if (value < 20) {
        return `${spellIndonesianNumber(value - 10)} belas`;
    }

    if (value < 100) {
        return `${spellIndonesianNumber(Math.floor(value / 10))} puluh ${spellIndonesianNumber(value % 10)}`.trim();
    }

    if (value < 200) {
        return `seratus ${spellIndonesianNumber(value - 100)}`.trim();
    }

    if (value < 1000) {
        return `${spellIndonesianNumber(Math.floor(value / 100))} ratus ${spellIndonesianNumber(value % 100)}`.trim();
    }

    if (value < 2000) {
        return `seribu ${spellIndonesianNumber(value - 1000)}`.trim();
    }

    if (value < 1_000_000) {
        return `${spellIndonesianNumber(Math.floor(value / 1000))} ribu ${spellIndonesianNumber(value % 1000)}`.trim();
    }

    if (value < 1_000_000_000) {
        return `${spellIndonesianNumber(Math.floor(value / 1_000_000))} juta ${spellIndonesianNumber(value % 1_000_000)}`.trim();
    }

    if (value < 1_000_000_000_000) {
        return `${spellIndonesianNumber(Math.floor(value / 1_000_000_000))} miliar ${spellIndonesianNumber(value % 1_000_000_000)}`.trim();
    }

    return `${spellIndonesianNumber(Math.floor(value / 1_000_000_000_000))} triliun ${spellIndonesianNumber(value % 1_000_000_000_000)}`.trim();
};

export const convertNumberToIndonesianCurrencyWords = (value: number): string => {
    const normalizedValue = Math.max(0, Math.floor(value));
    if (normalizedValue === 0) {
        return 'Nol rupiah';
    }

    const words = spellIndonesianNumber(normalizedValue)
        .replace(/\s+/g, ' ')
        .trim();

    return `${words.charAt(0).toUpperCase()}${words.slice(1)} rupiah`;
};

export const normalizePawnContractCustomerName = (value: string): string =>
    value.replace(/\s+/g, ' ').trim().toLowerCase();

export const ensureDateInputValue = (value: string): string => normalizeDateInput(value);
