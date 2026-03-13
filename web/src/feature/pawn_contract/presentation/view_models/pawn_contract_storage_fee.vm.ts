import { computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { convertNumberToIndonesianCurrencyWords, getPawnContractPrepaidStorageMax } from '@core/util/pawn-contract-form';
import type { PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';
import { createPawnContractStorageFeeState } from './pawn_contract_storage_fee.state';

export interface SelectablePeriod {
    id: number | string;
    label: string;
    dueDateLabel: string;
    amount: number;
    isPaid?: boolean;
}

export const pawnContractStorageFeeViewModel = defineStore('pawnContractStorageFeeStore', () => {
    const state = createPawnContractStorageFeeState();

    const selectablePeriods = computed<SelectablePeriod[]>(() => {
        if (!state.row.value) return [];

        const periods: SelectablePeriod[] = [];
        const unit = state.row.value.arrears.unitLabel;
        const storageFee = state.row.value.contract.storageFeeAmount;
        const termDays = state.row.value.contract.termDays;
        const intervalDays = state.row.value.contract.paymentOptionDays && state.row.value.contract.paymentOptionDays > 0 
            ? state.row.value.contract.paymentOptionDays 
            : termDays;

        // Add paid periods from item specification
        const item = state.row.value.items[0]?.item;
        const prepaidPeriodsCount = item?.specificationJson?.prepaid_storage_periods ?? 0;
        
        // Calculate total periods based on duration
        const totalBasePeriods = Math.ceil(termDays / intervalDays);

        // Calculate max period (base + overdue)
        const currentMaxPeriod = Math.max(
            totalBasePeriods, 
            prepaidPeriodsCount, 
            totalBasePeriods + state.row.value.arrears.overduePeriods + (state.row.value.arrears.dueTodayAmount > 0 ? 1 : 0)
        );

        for (let i = 1; i <= currentMaxPeriod; i++) {
            const isPaid = i <= prepaidPeriodsCount;
            const isTunggakan = i > totalBasePeriods;
            
            periods.push({
                id: isPaid ? `paid-${i}` : i,
                label: isTunggakan ? `Tunggakan ke-${i}` : `Periode ke-${i}`,
                dueDateLabel: isPaid 
                    ? 'Sudah lunas' 
                    : (isTunggakan 
                        ? `Tunggakan ${unit}` 
                        : (i === totalBasePeriods ? 'Jatuh tempo akhir' : 'Biaya titip')),
                amount: storageFee,
                isPaid: isPaid
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
        const selectableNonPaid = selectablePeriods.value.filter((p) => !p.isPaid);
        return (
            selectableNonPaid.length > 0 &&
            selectableNonPaid.every((p) => state.selectedPeriodIds.value.includes(p.id))
        );
    });

    const setRow = (row: PawnContractSummaryModel | null): void => {
        state.row.value = row;
    };

    const togglePeriod = (id: number | string): void => {
        const period = selectablePeriods.value.find((p) => p.id === id);
        if (period?.isPaid) return;

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
            state.selectedPeriodIds.value = selectablePeriods.value
                .filter((p) => !p.isPaid)
                .map((p) => p.id);
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
