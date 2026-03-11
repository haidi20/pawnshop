import { computed } from 'vue';
import { defineStore } from 'pinia';
import {
    formatCountForHumans,
    formatCurrencyValueForHumans,
    formatDateTimeForHumans,
    formatDateValueForHumans,
    getPawnContractStatusBadgeClass,
    getPawnContractStatusLabel,
    getPawnItemLocationStatusBadgeClass,
    getPawnItemLocationStatusLabel
} from '@core/util/helpers';
import { unwrapEitherOrThrow } from '@core/util/either';
import router from '@core/util/router';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';
import { getPawnContractHistoryUsecase } from '@feature/pawn_contract/presentation/di/pawn_contract.di';
import type { PawnContractHistoryEntryModel } from '@feature/pawn_contract/presentation/models/pawn_contract_history_ui.model';
import { createPawnContractHistoryState } from '@feature/pawn_contract/presentation/view_models/pawn_contract_history.state';

export const pawnContractHistoryViewModel = defineStore('pawnContractHistoryStore', () => {
    const state = createPawnContractHistoryState();

    const timelineEntries = computed<PawnContractHistoryEntryModel[]>(() =>
        state.summary.value ? buildTimelineEntries(state.summary.value) : []
    );

    const formatDate = (value: string | null): string => formatDateValueForHumans(value);
    const formatDateTime = (value: string | null): string => formatDateTimeForHumans(value);
    const formatCount = (value: number): string => formatCountForHumans(value);
    const formatCurrency = (value: number): string => formatCurrencyValueForHumans(value);
    const getContractStatusLabel = (value: PawnContractSummaryModel['contract']['contractStatus']): string =>
        getPawnContractStatusLabel(value);
    const getContractStatusClass = (value: PawnContractSummaryModel['contract']['contractStatus']): string =>
        getPawnContractStatusBadgeClass(value);
    const getLocationStatusLabel = (value: string | null): string => getPawnItemLocationStatusLabel(value);
    const getLocationStatusClass = (value: string | null): string => getPawnItemLocationStatusBadgeClass(value);

    const resetState = (): void => {
        state.currentContractId.value = null;
        state.summary.value = null;
        state.isLoading.value = false;
        state.error.value = null;
    };

    const loadData = async (contractId: number | null): Promise<void> => {
        state.currentContractId.value = contractId;

        if (contractId === null) {
            state.summary.value = null;
            state.error.value = 'ID kontrak tidak valid.';
            state.isLoading.value = false;
            return;
        }

        state.isLoading.value = true;
        state.error.value = null;

        try {
            state.summary.value = unwrapEitherOrThrow(await getPawnContractHistoryUsecase.execute(contractId));
        } catch (error) {
            state.summary.value = null;
            state.error.value = error instanceof Error ? error.message : String(error);
        } finally {
            state.isLoading.value = false;
        }
    };

    const loadByRouteParam = async (value: string | string[] | undefined): Promise<void> => {
        await loadData(parseContractId(value));
    };

    const reloadData = async (): Promise<void> => {
        await loadData(state.currentContractId.value);
    };

    const goBack = (): void => {
        void router.push({ name: 'PawnContract' });
    };

    return {
        ...state,
        timelineEntries,
        formatDate,
        formatDateTime,
        formatCount,
        formatCurrency,
        getContractStatusLabel,
        getContractStatusClass,
        getLocationStatusLabel,
        getLocationStatusClass,
        resetState,
        loadData,
        loadByRouteParam,
        reloadData,
        goBack
    };
});

function buildTimelineEntries(summary: PawnContractSummaryModel): PawnContractHistoryEntryModel[] {
    const entries: PawnContractHistoryEntryModel[] = [
        {
            key: `contract-created-${summary.contract.id}`,
            occurredAt: summary.contract.createdAt ?? summary.contract.contractDate,
            title: 'Gadai dibuat',
            description: `Kontrak ${summary.contract.contractNumber} dibuat untuk ${summary.customerName}.`,
            meta: [
                { label: 'Cabang', value: summary.branchName },
                { label: 'Nilai cair', value: formatCurrencyValueForHumans(summary.contract.disbursedValue) }
            ],
            sortValue: toSortValue(summary.contract.createdAt ?? summary.contract.contractDate)
        },
        {
            key: `contract-maturity-${summary.contract.id}`,
            occurredAt: summary.contract.maturityDate,
            title: 'Jatuh tempo kontrak',
            description: 'Batas akhir kontrak gadai untuk tindak lanjut pelunasan, perpanjangan, atau lelang.',
            meta: [
                { label: 'Status', value: getPawnContractStatusLabel(summary.contract.contractStatus) },
                { label: 'Biaya titip', value: formatCurrencyValueForHumans(summary.contract.storageFeeAmount) }
            ],
            sortValue: toSortValue(summary.contract.maturityDate)
        }
    ];

    if (summary.contract.updatedAt && summary.contract.updatedAt !== summary.contract.createdAt) {
        entries.push({
            key: `contract-updated-${summary.contract.id}`,
            occurredAt: summary.contract.updatedAt,
            title: 'Data gadai diperbarui',
            description: 'Perubahan terakhir pada kontrak tercatat di sistem lokal.',
            meta: [
                { label: 'Status proses', value: summary.processStatusLabel },
                { label: 'Lokasi barang', value: summary.locationLabel }
            ],
            sortValue: toSortValue(summary.contract.updatedAt)
        });
    }

    summary.items.forEach((itemDetail) => {
        itemDetail.locationMovements.forEach((movement) => {
            const occurredAt = movement.movedAt || movement.updatedAt || movement.createdAt;

            entries.push({
                key: `movement-${movement.id}`,
                occurredAt,
                title: `${itemDetail.item.itemName} dipindahkan`,
                description: movement.notes?.trim() || 'Perubahan lokasi barang jaminan.',
                meta: [
                    { label: 'Dari', value: getPawnItemLocationStatusLabel(movement.fromStatus) },
                    { label: 'Ke', value: getPawnItemLocationStatusLabel(movement.toStatus) }
                ],
                sortValue: toSortValue(occurredAt)
            });
        });
    });

    return entries.sort((left, right) => right.sortValue - left.sortValue);
}

function parseContractId(value: string | string[] | undefined): number | null {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const parsedValue = Number(rawValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
}

function toSortValue(value: string | null): number {
    if (!value) {
        return 0;
    }

    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value.replace(' ', 'T');
    const parsedValue = new Date(normalizedValue).getTime();

    return Number.isNaN(parsedValue) ? 0 : parsedValue;
}
