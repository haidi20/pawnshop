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
        
        // Calculate total periods based on duration using floor to match the 4 periods for 30/7
        const totalBasePeriods = Math.floor(termDays / intervalDays);

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
        const storageFeeSum = selectablePeriods.value
            .filter((p) => state.selectedPeriodIds.value.includes(p.id))
            .reduce((sum, p) => sum + p.amount, 0);
            
        const payoffAmount = state.isPayingOff.value && state.row.value?.contract.disbursedValue 
            ? state.row.value.contract.disbursedValue 
            : 0;

        return storageFeeSum + payoffAmount;
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
        const targetPeriod = selectablePeriods.value.find((p) => p.id === id);
        if (!targetPeriod || targetPeriod.isPaid) return;

        // Ensure id is a number for numerical comparison
        const targetIdNum = typeof id === 'number' ? id : parseInt(id, 10);
        const isCurrentlySelected = state.selectedPeriodIds.value.includes(id);

        if (!isCurrentlySelected) {
            // Selecting: select this item and all unpaid items before it
            const idsToSelect = selectablePeriods.value
                .filter(p => !p.isPaid)
                .map(p => p.id)
                .filter(pId => {
                    const numId = typeof pId === 'number' ? pId : parseInt(pId as string, 10);
                    return numId <= targetIdNum;
                });
            
            idsToSelect.forEach(periodId => {
                if (!state.selectedPeriodIds.value.includes(periodId)) {
                    state.selectedPeriodIds.value.push(periodId);
                }
            });
        } else {
            // Unselecting: unselect this item and all items after it
            state.selectedPeriodIds.value = state.selectedPeriodIds.value.filter(existingId => {
                const numExistingId = typeof existingId === 'number' ? existingId : parseInt(existingId as string, 10);
                return numExistingId < targetIdNum;
            });
            state.isPayingOff.value = false;
        }
    };

    const toggleSelectAll = (): void => {
        if (isAllSelected.value) {
            state.selectedPeriodIds.value = [];
            state.isPayingOff.value = false;
        } else {
            state.selectedPeriodIds.value = selectablePeriods.value
                .filter((p) => !p.isPaid)
                .map((p) => p.id);
        }
    };

    const togglePayoff = (): void => {
        const newValue = !state.isPayingOff.value;
        state.isPayingOff.value = newValue;
        if (newValue) {
            state.selectedPeriodIds.value = selectablePeriods.value
                .filter((p) => !p.isPaid)
                .map((p) => p.id);
        } else {
            state.selectedPeriodIds.value = [];
        }
    };

    const resetSelection = (): void => {
        state.selectedPeriodIds.value = [];
        state.isPayingOff.value = false;
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
        togglePayoff,
        resetSelection,
        isPayingOff: state.isPayingOff
    };
});
