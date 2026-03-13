import { computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { convertNumberToIndonesianCurrencyWords } from '@core/util/pawn-contract-form';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';
import { createPawnContractStorageFeeState } from './pawn_contract_storage_fee.state';

export interface SelectablePeriod {
    id: number;
    label: string;
    dueDateLabel: string;
    amount: number;
}

export const pawnContractStorageFeeViewModel = defineStore('pawnContractStorageFeeStore', () => {
    const state = createPawnContractStorageFeeState();

    const selectablePeriods = computed<SelectablePeriod[]>(() => {
        if (!state.row.value) return [];

        const periods: SelectablePeriod[] = [];
        const unit = state.row.value.arrears.unitLabel;
        const storageFee = state.row.value.contract.storageFeeAmount;

        // Add overdue periods
        for (let i = 1; i <= state.row.value.arrears.overduePeriods; i++) {
            periods.push({
                id: i,
                label: `Tunggakan ke-${i}`,
                dueDateLabel: `Tunggakan ${unit}`,
                amount: storageFee
            });
        }

        // Add due today period if exists
        if (state.row.value.arrears.dueTodayAmount > 0) {
            periods.push({
                id: state.row.value.arrears.overduePeriods + 1,
                label: 'Jatuh Tempo Hari Ini',
                dueDateLabel: 'Periode berjalan',
                amount: storageFee
            });
        }

        return periods;
    });

    const totalPotentialAmount = computed(() => {
        if (!state.row.value) return 0;
        return (state.row.value.arrears.overdueAmount ?? 0) + (state.row.value.arrears.dueTodayAmount ?? 0);
    });

    const totalSelectedAmount = computed(() => {
        return selectablePeriods.value
            .filter((p) => state.selectedPeriodIds.value.includes(p.id))
            .reduce((sum, p) => sum + p.amount, 0);
    });

    const remainingAmount = computed(() => {
        return Math.max(0, totalPotentialAmount.value - totalSelectedAmount.value);
    });

    const amountInWords = computed(() => {
        return convertNumberToIndonesianCurrencyWords(totalSelectedAmount.value);
    });

    const isAllSelected = computed(() => {
        return (
            selectablePeriods.value.length > 0 &&
            state.selectedPeriodIds.value.length === selectablePeriods.value.length
        );
    });

    const setRow = (row: PawnContractSummaryModel | null): void => {
        state.row.value = row;
    };

    const togglePeriod = (id: number): void => {
        const index = state.selectedPeriodIds.value.indexOf(id);
        if (index === -1) {
            state.selectedPeriodIds.value.push(id);
        } else {
            state.selectedPeriodIds.value.splice(index, 1);
        }
    };

    const toggleSelectAll = (): void => {
        if (isAllSelected.value) {
            state.selectedPeriodIds.value = [];
        } else {
            state.selectedPeriodIds.value = selectablePeriods.value.map((p) => p.id);
        }
    };

    const resetSelection = (): void => {
        state.selectedPeriodIds.value = [];
    };

    watch(() => state.row.value, (newRow) => {
        if (newRow) {
            resetSelection();
        }
    });

    return {
        ...state,
        selectablePeriods,
        totalPotentialAmount,
        totalSelectedAmount,
        remainingAmount,
        amountInWords,
        isAllSelected,
        setRow,
        togglePeriod,
        toggleSelectAll,
        resetSelection
    };
});
