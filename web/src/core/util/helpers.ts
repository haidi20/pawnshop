import type { EnumOptionModel } from '@core/domain/models/enum-option.model';
import {
    formatCurrencyForHumans,
    formatDateForHumans,
    getTodayDateValue,
    pawnContractPaymentOptions,
    pawnContractTermOptions
} from '@core/util/pawn-contract-form';

export type PawnContractStatusModel =
    | 'draft'
    | 'active'
    | 'extended'
    | 'redeemed'
    | 'auctioned'
    | 'closed'
    | 'cancelled';

export const pawnContractStatusLabelMap: Record<PawnContractStatusModel, string> = {
    draft: 'Draf',
    active: 'Aktif',
    extended: 'Diperpanjang',
    redeemed: 'Lunas',
    auctioned: 'Dilelang',
    closed: 'Lunas',
    cancelled: 'Dibatalkan'
};

export const pawnContractStatusOptions: EnumOptionModel<PawnContractStatusModel>[] = [
    { value: 'draft', label: pawnContractStatusLabelMap.draft },
    { value: 'active', label: pawnContractStatusLabelMap.active },
    { value: 'extended', label: pawnContractStatusLabelMap.extended },
    { value: 'redeemed', label: pawnContractStatusLabelMap.redeemed },
    { value: 'auctioned', label: pawnContractStatusLabelMap.auctioned },
    { value: 'closed', label: pawnContractStatusLabelMap.closed },
    { value: 'cancelled', label: pawnContractStatusLabelMap.cancelled }
];

export type PawnItemLocationStatusModel =
    | 'in_office'
    | 'in_warehouse'
    | 'released'
    | 'auctioned'
    | 'returned'
    | 'other';

export const pawnItemLocationStatusLabelMap: Record<PawnItemLocationStatusModel, string> = {
    in_office: 'Di kantor',
    in_warehouse: 'Di gudang',
    released: 'Dikeluarkan',
    auctioned: 'Dilelang',
    returned: 'Dikembalikan',
    other: 'Lainnya'
};

export const pawnItemLocationStatusOptions: EnumOptionModel<PawnItemLocationStatusModel>[] = [
    { value: 'in_office', label: pawnItemLocationStatusLabelMap.in_office },
    { value: 'in_warehouse', label: pawnItemLocationStatusLabelMap.in_warehouse },
    { value: 'released', label: pawnItemLocationStatusLabelMap.released },
    { value: 'auctioned', label: pawnItemLocationStatusLabelMap.auctioned },
    { value: 'returned', label: pawnItemLocationStatusLabelMap.returned },
    { value: 'other', label: pawnItemLocationStatusLabelMap.other }
];

export type PawnContractDueStateModel = 'safe' | 'soon' | 'today' | 'overdue';
export interface PawnContractEstimatedArrearsModel {
    overduePeriods: number;
    overdueAmount: number;
    dueTodayAmount: number;
    unitLabel: 'Hari' | 'Periode';
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const countFormatter = new Intl.NumberFormat('id-ID');
const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});
const monthYearFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric'
});

const createDateOnlyValue = (value: string): Date => new Date(`${value}T00:00:00`);
const createDateTimeValue = (value: string): Date => new Date(value.replace(' ', 'T'));
const createMonthStartValue = (year: number, monthIndex: number): Date => new Date(year, monthIndex, 1);

export const formatCountForHumans = (value: number): string => countFormatter.format(value);

export const formatCurrencyValueForHumans = (value: number): string => formatCurrencyForHumans(value);

export const formatDateValueForHumans = (value: string | null): string =>
    value ? formatDateForHumans(value) : '-';

export const formatDateTimeForHumans = (value: string | null): string => {
    if (!value) {
        return '-';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return formatDateForHumans(value);
    }

    const parsedValue = createDateTimeValue(value);
    if (Number.isNaN(parsedValue.getTime())) {
        return value;
    }

    return dateTimeFormatter.format(parsedValue);
};

export const getPawnContractStatusLabel = (status: PawnContractStatusModel): string =>
    pawnContractStatusLabelMap[status] ?? status;

export const getPawnContractStatusBadgeClass = (status: PawnContractStatusModel): string => {
    switch (status) {
        case 'draft':
            return 'status-badge--warning';
        case 'active':
        case 'extended':
        case 'redeemed':
        case 'closed':
            return 'status-badge--success';
        case 'auctioned':
            return 'status-badge--danger';
        default:
            return 'status-badge--neutral';
    }
};

export const getPawnItemLocationStatusLabel = (
    status: PawnItemLocationStatusModel | string | null
): string => {
    if (!status) {
        return '-';
    }

    return pawnItemLocationStatusLabelMap[status as PawnItemLocationStatusModel] ?? status.replace(/_/g, ' ');
};

export const getPawnItemLocationStatusBadgeClass = (
    status: PawnItemLocationStatusModel | string | null
): string => {
    switch (status) {
        case 'in_office':
            return 'status-badge--success';
        case 'in_warehouse':
            return 'status-badge--accent';
        case 'auctioned':
            return 'status-badge--danger';
        default:
            return 'status-badge--neutral';
    }
};

export const buildPawnContractLocationLabel = (statuses: string[]): string => {
    if (statuses.length === 0) {
        return '-';
    }

    if (statuses.length === 1) {
        return getPawnItemLocationStatusLabel(statuses[0]);
    }

    return `${statuses.length} status lokasi`;
};

export const getPawnContractDueState = (daysToMaturity: number): PawnContractDueStateModel => {
    if (daysToMaturity < 0) {
        return 'overdue';
    }

    if (daysToMaturity === 0) {
        return 'today';
    }

    if (daysToMaturity <= 7) {
        return 'soon';
    }

    return 'safe';
};

export const getPawnContractDueLabel = (daysToMaturity: number): string => {
    if (daysToMaturity < 0) {
        return `Lewat ${formatCountForHumans(Math.abs(daysToMaturity))} hari`;
    }

    if (daysToMaturity === 0) {
        return 'Jatuh tempo hari ini';
    }

    return `${formatCountForHumans(daysToMaturity)} hari lagi`;
};

export const getPawnContractDueStateBadgeClass = (
    dueState: PawnContractDueStateModel
): string => {
    switch (dueState) {
        case 'today':
            return 'status-badge--warning';
        case 'soon':
            return 'status-badge--accent';
        case 'overdue':
            return 'status-badge--danger';
        default:
            return 'status-badge--neutral';
    }
};

export const getPawnContractDaysToDate = (value: string): number => {
    const today = createDateOnlyValue(getTodayDateValue());
    const targetDate = createDateOnlyValue(value);
    return Math.floor((targetDate.getTime() - today.getTime()) / DAY_IN_MS);
};

export const isSameDateValue = (left: string | null, right: string | null): boolean => {
    if (!left || !right) {
        return false;
    }

    return left.slice(0, 10) === right.slice(0, 10);
};

export const formatMonthYearForHumans = (value: string): string => {
    return monthYearFormatter.format(createDateOnlyValue(value));
};

export const getMonthOffsetFromToday = (value: string): number => {
    const today = createDateOnlyValue(getTodayDateValue());
    const targetDate = createDateOnlyValue(value);
    return (today.getFullYear() - targetDate.getFullYear()) * 12 + (today.getMonth() - targetDate.getMonth());
};

export const getMonthRangeByOffset = (monthOffset: number): { start: string; end: string } => {
    const today = createDateOnlyValue(getTodayDateValue());
    const year = today.getFullYear();
    const monthIndex = today.getMonth() - monthOffset;
    const monthStart = createMonthStartValue(year, monthIndex);
    const monthEnd = createMonthStartValue(year, monthIndex + 1);
    monthEnd.setDate(monthEnd.getDate() - 1);

    return {
        start: monthStart.toISOString().slice(0, 10),
        end: monthEnd.toISOString().slice(0, 10)
    };
};

export const isDateWithinRange = (value: string, start: string, end: string): boolean => {
    const targetDate = createDateOnlyValue(value);
    const startDate = createDateOnlyValue(start);
    const endDate = createDateOnlyValue(end);
    return targetDate.getTime() >= startDate.getTime() && targetDate.getTime() <= endDate.getTime();
};

export const getPawnContractEstimatedArrears = (params: {
    maturityDate: string;
    paymentOptionDays: number | null;
    storageFeeAmount: number;
}): PawnContractEstimatedArrearsModel => {
    const intervalDays = params.paymentOptionDays && params.paymentOptionDays > 0 ? params.paymentOptionDays : 1;
    const overdueDays = Math.max(0, -getPawnContractDaysToDate(params.maturityDate));
    const overduePeriods = overdueDays > 0 ? Math.ceil(overdueDays / intervalDays) : 0;
    const dueTodayAmount = getPawnContractDaysToDate(params.maturityDate) === 0 ? params.storageFeeAmount : 0;

    return {
        overduePeriods,
        overdueAmount: overduePeriods * params.storageFeeAmount,
        dueTodayAmount,
        unitLabel: intervalDays === 1 ? 'Hari' : 'Periode'
    };
};

export const sortDateOnlyDesc = (left: string, right: string): number =>
    createDateOnlyValue(right).getTime() - createDateOnlyValue(left).getTime();

export const sortDateTimeDesc = (left: string, right: string): number =>
    createDateTimeValue(right).getTime() - createDateTimeValue(left).getTime();

export const getPawnContractPaymentOptionLabel = (value: number | null): string => {
    const option = pawnContractPaymentOptions.find((item) => item.value === value);
    return option?.label ?? (value ? `Per ${value} hari` : '-');
};

export const getPawnContractTermLabel = (value: number): string => {
    const option = pawnContractTermOptions.find((item) => item.value === value);
    return option?.label ?? `${value} hari`;
};

export const buildPawnItemDescriptor = (params: {
    brandName: string | null;
    modelName: string | null;
    serialNumber: string | null;
    itemDescription: string | null;
}): string => {
    const parts = [params.brandName, params.modelName, params.serialNumber].filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0
    );

    if (parts.length > 0) {
        return parts.join(' | ');
    }

    return params.itemDescription || 'Spesifikasi barang belum dilengkapi.';
};

export const buildPawnContractIdentityLabel = (
    identityType: string | null,
    identityNumber: string | null
): string => {
    if (identityType && identityNumber) {
        return `${identityType} ${identityNumber}`;
    }

    return identityNumber ?? '-';
};
