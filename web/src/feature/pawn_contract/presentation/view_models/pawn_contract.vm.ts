import { computed, watch } from 'vue';
import { defineStore } from 'pinia';

import {
    buildPawnItemDescriptor,
    formatCountForHumans,
    formatCurrencyValueForHumans,
    formatDateTimeForHumans,
    formatDateValueForHumans,
    formatMonthYearForHumans,
    getPawnContractDueStateBadgeClass,
    getPawnContractPaymentOptionLabel,
    getPawnContractStatusBadgeClass,
    getPawnContractStatusLabel,
    getPawnContractTermLabel,
    getPawnItemLocationStatusBadgeClass,
    getPawnItemLocationStatusLabel,
    pawnContractStatusOptions,
    type PawnContractDueStateModel,
    type PawnContractStatusModel
} from '@core/util/helpers';
import type {
    PawnContractDataFilterModel,
    PawnContractItemDetailModel
} from '@feature/pawn_contract/domain/models';
import {
    getPawnContractAjtTableUsecase,
    getPawnContractDataUsecase,
    getPawnContractIndexTabsUsecase,
    getPawnContractLocationTableUsecase,
    getPawnContractMaintenanceTableUsecase,
    getPawnContractNasabahTableUsecase,
    getPawnContractRingkasanTableUsecase,
    getPawnContractSettlementTableUsecase,
    getPawnContractSummariesUsecase
} from '@feature/pawn_contract/presentation/di/pawn_contract.di';
import {
    createPawnContractState,
    type PawnContractAjtTypeModel,
    type PawnContractIndexTabKeyModel,
    type PawnContractLocationTabModel,
    type PawnContractNasabahTabKeyModel,
    type PawnContractSettlementTypeModel
} from '@feature/pawn_contract/presentation/view_models/pawn_contract.state';

export const pawnContractViewModel = defineStore('pawnContractStore', () => {
    const state = createPawnContractState();

    const setters = {
        setError: (message: string | null): void => {
            state.error.value = message;
        },
        setActiveIndexTab: (value: PawnContractIndexTabKeyModel): void => {
            state.activeIndexTab.value = value;
        },
        setActiveNasabahTab: (value: PawnContractNasabahTabKeyModel): void => {
            state.activeNasabahTab.value = value;
        },
        setActiveAjtType: (value: PawnContractAjtTypeModel): void => {
            state.activeAjtType.value = value;
        },
        setActiveSettlementType: (value: PawnContractSettlementTypeModel): void => {
            state.activeSettlementType.value = value;
        },
        setActiveLocationTab: (value: PawnContractLocationTabModel): void => {
            state.activeLocationTab.value = value;
        }
    };

    const activeData = computed(() => state.filteredData.value ?? state.data.value);
    const sortedBranches = computed(() =>
        [...(state.data.value?.branches ?? [])].sort((left, right) =>
            left.branchName.localeCompare(right.branchName, 'id-ID')
        )
    );
    const contractSummaries = computed(() =>
        getPawnContractSummariesUsecase.execute(activeData.value)
    );
    const openContractSummaries = computed(() =>
        contractSummaries.value.filter((item) => item.isOpenContract)
    );

    const nasabahTable = computed(() =>
        getPawnContractNasabahTableUsecase.execute({
            summaries: openContractSummaries.value,
            activeTab: state.activeNasabahTab.value
        })
    );
    const ringkasanTable = computed(() =>
        getPawnContractRingkasanTableUsecase.execute({
            summaries: contractSummaries.value
        })
    );
    const ajtTable = computed(() =>
        getPawnContractAjtTableUsecase.execute({
            summaries: openContractSummaries.value,
            activeType: state.activeAjtType.value
        })
    );
    const settlementTable = computed(() =>
        getPawnContractSettlementTableUsecase.execute({
            summaries: contractSummaries.value,
            activeType: state.activeSettlementType.value
        })
    );
    const locationTable = computed(() =>
        getPawnContractLocationTableUsecase.execute({
            summaries: contractSummaries.value,
            activeTab: state.activeLocationTab.value
        })
    );
    const maintenanceTable = computed(() =>
        getPawnContractMaintenanceTableUsecase.execute({
            summaries: contractSummaries.value
        })
    );

    const indexTabs = computed(() =>
        getPawnContractIndexTabsUsecase.execute({
            openContractCount: openContractSummaries.value.length,
            ringkasanRowCount: ringkasanTable.value.sections.reduce(
                (total, section) => total + section.rows.length,
                0
            ),
            ajtRowCount: ajtTable.value.rows.length,
            settlementRowCount: settlementTable.value.rows.length,
            locationRowCount: locationTable.value.rows.length,
            maintenanceRowCount: maintenanceTable.value.rows.length
        })
    );

    const nasabahTabs = computed(() => nasabahTable.value.tabs);
    const nasabahAllSections = computed(() => nasabahTable.value.sections);
    const activeNasabahSection = computed(() => nasabahTable.value.activeSection);
    const displayedNasabahSections = computed(() => nasabahTable.value.displayedSections);
    const ringkasanSections = computed(() => ringkasanTable.value.sections);
    const ringkasanPendapatanRows = computed(() => ringkasanTable.value.pendapatanRows);
    const ringkasanMetrics = computed(() => ringkasanTable.value.metrics);
    const ajtOptions = computed(() => ajtTable.value.options);
    const ajtRows = computed(() => ajtTable.value.rows);
    const settlementOptions = computed(() => settlementTable.value.options);
    const settlementRows = computed(() => settlementTable.value.rows);
    const locationOptions = computed(() => locationTable.value.options);
    const locationRows = computed(() => locationTable.value.rows);
    const maintenanceRows = computed(() => maintenanceTable.value.rows);

    const hasActiveFilters = computed(
        () => state.branchFilter.value !== 'all' || state.statusFilter.value !== 'all'
    );

    watch(
        [state.branchFilter, state.statusFilter],
        async () => {
            await actions.loadFilteredData();
        }
    );

    const actions = {
        loadData: async (): Promise<void> => {
            state.isLoading.value = true;
            setters.setError(null);

            try {
                state.data.value = await getPawnContractDataUsecase.execute();
                const dataFilter = buildDataFilter({
                    branchFilter: state.branchFilter.value,
                    statusFilter: state.statusFilter.value
                });

                state.filteredData.value = isDefaultDataFilter(dataFilter)
                    ? state.data.value
                    : await getPawnContractDataUsecase.execute(dataFilter);
            } catch (error) {
                setters.setError(error instanceof Error ? error.message : String(error));
            } finally {
                state.isLoading.value = false;
            }
        },
        loadFilteredData: async (): Promise<void> => {
            if (!state.data.value) {
                return;
            }

            const dataFilter = buildDataFilter({
                branchFilter: state.branchFilter.value,
                statusFilter: state.statusFilter.value
            });

            if (isDefaultDataFilter(dataFilter)) {
                state.filteredData.value = state.data.value;
                return;
            }

            setters.setError(null);

            try {
                state.filteredData.value = await getPawnContractDataUsecase.execute(dataFilter);
            } catch (error) {
                setters.setError(error instanceof Error ? error.message : String(error));
            }
        },
        resetFilters: (): void => {
            state.branchFilter.value = 'all';
            state.statusFilter.value = 'all';
        }
    };

    const formatters = {
        formatCurrency: (value: number): string => formatCurrencyValueForHumans(value),
        formatDate: (value: string | null): string => formatDateValueForHumans(value),
        formatDateTime: (value: string | null): string => formatDateTimeForHumans(value),
        formatCount: (value: number): string => formatCountForHumans(value),
        formatMonthYear: (value: string): string => formatMonthYearForHumans(value),
        getContractStatusLabel: (status: PawnContractStatusModel): string =>
            getPawnContractStatusLabel(status),
        getContractStatusClass: (status: PawnContractStatusModel): string =>
            getPawnContractStatusBadgeClass(status),
        getDueStateClass: (dueState: PawnContractDueStateModel): string =>
            getPawnContractDueStateBadgeClass(dueState),
        getLocationStatusLabel: (status: string | null): string =>
            getPawnItemLocationStatusLabel(status),
        getLocationStatusClass: (status: string | null): string =>
            getPawnItemLocationStatusBadgeClass(status),
        getPaymentOptionLabel: (value: number | null): string =>
            getPawnContractPaymentOptionLabel(value),
        getTermLabel: (value: number): string => getPawnContractTermLabel(value),
        getItemDescriptor: (itemDetail: PawnContractItemDetailModel): string =>
            buildPawnItemDescriptor({
                brandName: itemDetail.item.brandName,
                modelName: itemDetail.item.modelName,
                serialNumber: itemDetail.item.serialNumber,
                itemDescription: itemDetail.item.itemDescription
            })
    };

    return {
        ...state,
        ...setters,
        ...actions,
        ...formatters,
        sortedBranches,
        contractSummaries,
        openContractSummaries,
        indexTabs,
        nasabahTable,
        nasabahTabs,
        nasabahAllSections,
        activeNasabahSection,
        displayedNasabahSections,
        ringkasanTable,
        ringkasanSections,
        ringkasanPendapatanRows,
        ringkasanMetrics,
        ajtTable,
        ajtOptions,
        ajtRows,
        settlementTable,
        settlementOptions,
        settlementRows,
        locationTable,
        locationOptions,
        locationRows,
        maintenanceTable,
        maintenanceRows,
        hasActiveFilters,
        contractStatusOptions: pawnContractStatusOptions,
        getPawnContractData: actions.loadData
    };
});

function buildDataFilter(params: {
    branchFilter: string;
    statusFilter: 'all' | PawnContractStatusModel;
}): PawnContractDataFilterModel {
    return {
        branchId:
            params.branchFilter !== 'all' && Number.isFinite(Number(params.branchFilter))
                ? Number(params.branchFilter)
                : null,
        contractStatus: params.statusFilter === 'all' ? null : params.statusFilter,
        onlyOpenContracts: false,
        dueWithinDays: null,
        maintenanceRequired: false,
        warehouseOnly: false
    };
}

function isDefaultDataFilter(filter: PawnContractDataFilterModel): boolean {
    return (
        filter.branchId === null &&
        filter.contractStatus === null &&
        !filter.onlyOpenContracts &&
        filter.dueWithinDays === null &&
        !filter.maintenanceRequired &&
        !filter.warehouseOnly
    );
}
