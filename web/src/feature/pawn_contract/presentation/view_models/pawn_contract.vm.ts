import { computed, watch, type ComputedRef, type Ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

import { DataTableClientSideService } from '@core/presentation/services/datatable_clientside.service';
import type { DataTableClientSideVM } from '@core/presentation/view_models/datatable_clientside.vm';
import { unwrapEitherOrThrow } from '@core/util/either';
import {
    formatCountForHumans,
    formatCurrencyValueForHumans,
    formatDateValueForHumans,
    getPawnContractDueStateBadgeClass,
    getPawnContractStatusBadgeClass,
    getPawnContractStatusLabel,
    getPawnContractTermLabel,
    getPawnItemLocationStatusBadgeClass,
    pawnContractStatusOptions,
    type PawnContractDueStateModel,
    type PawnContractStatusModel
} from '@core/util/helpers';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';
import {
    getCurrentAuthPortalBranchAccess,
    readAuthPortalStoredSession
} from '@feature/auth_portal/util/auth_portal_session';
import type {
    PawnContractDataFilterModel,
    PawnContractLocationRowModel,
    PawnContractMaintenanceRowModel,
    PawnContractNasabahSectionModel,
    PawnContractRingkasanPendapatanRowModel,
    PawnContractRingkasanSectionModel,
    PawnContractSummaryModel
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
    ajtTableFields,
    createPawnContractState,
    locationTableFields,
    maintenanceTableFields,
    nasabahTableFields,
    ringkasanPendapatanTableFields,
    ringkasanTableFields,
    settlementTableFields,
    type PawnContractAjtTypeModel,
    type PawnContractIndexTabKeyModel,
    type PawnContractLocationTabModel,
    type PawnContractNasabahTabKeyModel,
    type PawnContractSettlementTypeModel,
    type PawnContractTableField
} from '@feature/pawn_contract/presentation/view_models/pawn_contract.state';

export type PawnContractClientTableRow<TSource = unknown> = Record<string, unknown> & {
    id: number | string;
    source: TSource;
};

type PawnContractRowsSource<TSource> = ComputedRef<TSource[]> | Ref<TSource[]>;

export type PawnContractSectionTableModel<TSection, TRow extends Record<string, unknown>> = TSection & {
    vm: DataTableClientSideVM<TRow>;
};

export type PawnContractSummaryTableRow = PawnContractClientTableRow<PawnContractSummaryModel>;
export type PawnContractRingkasanPendapatanTableRow =
    PawnContractClientTableRow<PawnContractRingkasanPendapatanRowModel>;
export type PawnContractLocationTableRow = PawnContractClientTableRow<PawnContractLocationRowModel>;
export type PawnContractMaintenanceTableRow =
    PawnContractClientTableRow<PawnContractMaintenanceRowModel>;
export type PawnContractNasabahSectionTableModel = PawnContractSectionTableModel<
    PawnContractNasabahSectionModel,
    PawnContractSummaryTableRow
>;
export type PawnContractRingkasanSectionTableModel = PawnContractSectionTableModel<
    PawnContractRingkasanSectionModel,
    PawnContractSummaryTableRow
>;

const createClientTableVm = <TSource, TRow extends Record<string, unknown>>(
    sourceRows: PawnContractRowsSource<TSource>,
    fields: PawnContractTableField[],
    mapRow: (row: TSource, index: number) => TRow
): DataTableClientSideVM<TRow> => {
    const service = new DataTableClientSideService<TRow>(fields, []);

    watch(
        sourceRows,
        (rows) => {
            service.setItems(rows.map(mapRow));
        },
        { immediate: true, deep: true }
    );

    return service.vm;
};

const createSectionTableRegistry = <
    TSource,
    TSection extends { key: string; rows: TSource[] },
    TRow extends Record<string, unknown>
>(
    sections: PawnContractRowsSource<TSection>,
    fields: PawnContractTableField[],
    mapRow: (row: TSource, index: number) => TRow
): ComputedRef<Array<PawnContractSectionTableModel<TSection, TRow>>> => {
    const services = new Map<string, DataTableClientSideService<TRow>>();

    const ensureService = (key: string): DataTableClientSideService<TRow> => {
        const existingService = services.get(key);

        if (existingService) {
            return existingService;
        }

        const service = new DataTableClientSideService<TRow>(fields, []);
        services.set(key, service);
        return service;
    };

    watch(
        sections,
        (currentSections) => {
            currentSections.forEach((section) => {
                ensureService(section.key).setItems(section.rows.map(mapRow));
            });
        },
        { immediate: true, deep: true }
    );

    return computed(() =>
        sections.value.map((section) => ({
            ...section,
            vm: ensureService(section.key).vm
        }))
    );
};

export const pawnContractViewModel = defineStore('pawnContractStore', () => {
    const state = createPawnContractState();
    const authVm = authPortalViewModel();
    const { currentSession } = storeToRefs(authVm);
    const branchAccess = computed(() => {
        const session = currentSession.value;

        if (session) {
            return {
                canAccessAllBranches: session.user.role === 'owner',
                assignedBranchId: session.user.assignedBranchId,
                assignedBranchName: session.user.assignedBranchName
            };
        }

        return getCurrentAuthPortalBranchAccess();
    });
    const accessSessionKey = computed(() => {
        const session = currentSession.value ?? readAuthPortalStoredSession();

        return [
            session?.company.id ?? 'public',
            session?.user.id ?? 'guest',
            session?.user.role ?? 'guest',
            session?.user.assignedBranchId ?? 'none'
        ].join(':');
    });

    state.branchFilter.value = resolveDefaultBranchFilter(branchAccess.value);

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
        unwrapEitherOrThrow(getPawnContractSummariesUsecase.execute(activeData.value))
    );
    const openContractSummaries = computed(() =>
        contractSummaries.value.filter((item) => item.isOpenContract)
    );

    const nasabahTable = computed(() =>
        unwrapEitherOrThrow(
            getPawnContractNasabahTableUsecase.execute({
                summaries: openContractSummaries.value,
                activeTab: state.activeNasabahTab.value
            })
        )
    );
    const ringkasanTable = computed(() =>
        unwrapEitherOrThrow(
            getPawnContractRingkasanTableUsecase.execute({
                summaries: contractSummaries.value
            })
        )
    );
    const ajtTable = computed(() =>
        unwrapEitherOrThrow(
            getPawnContractAjtTableUsecase.execute({
                summaries: openContractSummaries.value,
                activeType: state.activeAjtType.value
            })
        )
    );
    const settlementTable = computed(() =>
        unwrapEitherOrThrow(
            getPawnContractSettlementTableUsecase.execute({
                summaries: contractSummaries.value,
                activeType: state.activeSettlementType.value
            })
        )
    );
    const locationTable = computed(() =>
        unwrapEitherOrThrow(
            getPawnContractLocationTableUsecase.execute({
                summaries: contractSummaries.value,
                activeTab: state.activeLocationTab.value
            })
        )
    );
    const maintenanceTable = computed(() =>
        unwrapEitherOrThrow(
            getPawnContractMaintenanceTableUsecase.execute({
                summaries: contractSummaries.value
            })
        )
    );

    const indexTabs = computed(() =>
        unwrapEitherOrThrow(
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
        )
    );
    const activeIndexTabMeta = computed(() => {
        const currentTab = indexTabs.value.find((tab) => tab.key === state.activeIndexTab.value);

        return {
            label: currentTab?.label ?? 'Index Gadai',
            description:
                currentTab?.description ??
                'Pantau data gadai secara terpusat dengan filter cabang dan status kontrak.'
        };
    });

    const nasabahTabs = computed(() => nasabahTable.value.tabs);
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

    const formatters = {
        formatCurrency: (value: number): string => formatCurrencyValueForHumans(value),
        formatDate: (value: string | null): string => formatDateValueForHumans(value),
        formatCount: (value: number): string => formatCountForHumans(value),
        getContractStatusLabel: (status: PawnContractStatusModel): string =>
            getPawnContractStatusLabel(status),
        getContractStatusClass: (status: PawnContractStatusModel): string =>
            getPawnContractStatusBadgeClass(status),
        getDueStateClass: (dueState: PawnContractDueStateModel): string =>
            getPawnContractDueStateBadgeClass(dueState),
        getLocationStatusClass: (status: string | null): string =>
            getPawnItemLocationStatusBadgeClass(status),
        getTermLabel: (value: number): string => getPawnContractTermLabel(value)
    };

    const mapNasabahTableRow = (
        row: PawnContractSummaryModel
    ): PawnContractClientTableRow<PawnContractSummaryModel> => ({
        id: row.contract.id,
        source: row,
        contractNumber: row.contract.contractNumber,
        customerName: row.customerName,
        branchName: row.branchName,
        customerPhone: row.customerPhone,
        customerIdentity: row.customerIdentity,
        itemNames: row.itemNames,
        principalAmount: formatters.formatCurrency(row.contract.disbursedValue),
        arrearsAmount: formatters.formatCurrency(row.arrears.overdueAmount),
        dueTodayAmount: formatters.formatCurrency(row.arrears.dueTodayAmount),
        contractDate: formatters.formatDate(row.contract.contractDate),
        maturityDate: formatters.formatDate(row.contract.maturityDate),
        dueLabel: row.dueLabel,
        processStatusLabel: row.processStatusLabel
    });

    const mapRingkasanTableRow = (
        row: PawnContractSummaryModel
    ): PawnContractClientTableRow<PawnContractSummaryModel> => ({
        id: row.contract.id,
        source: row,
        contractNumber: row.contract.contractNumber,
        customerName: row.customerName,
        branchName: row.branchName,
        itemNames: row.itemNames,
        principalAmount: formatters.formatCurrency(row.contract.disbursedValue),
        statusLabel: formatters.getContractStatusLabel(row.contract.contractStatus),
        processStatusLabel: row.processStatusLabel
    });

    const mapRingkasanPendapatanTableRow = (
        row: PawnContractRingkasanPendapatanRowModel
    ): PawnContractClientTableRow<PawnContractRingkasanPendapatanRowModel> => ({
        id: row.contractId,
        source: row,
        contractNumber: row.contractNumber,
        customerName: row.customerName,
        branchName: row.branchName,
        storageFeeAmount: formatters.formatCurrency(row.storageFeeAmount),
        administrationFeeAmount: formatters.formatCurrency(row.administrationFeeAmount),
        totalIncome: formatters.formatCurrency(row.totalIncome)
    });

    const mapAjtTableRow = (
        row: PawnContractSummaryModel
    ): PawnContractClientTableRow<PawnContractSummaryModel> => ({
        id: row.contract.id,
        source: row,
        contractNumber: row.contract.contractNumber,
        customerName: row.customerName,
        itemNames: row.itemNames,
        maturityDate: formatters.formatDate(row.contract.maturityDate),
        dueLabel: row.dueLabel,
        termLabel: formatters.getTermLabel(row.contract.termDays),
        statusLabel: formatters.getContractStatusLabel(row.contract.contractStatus)
    });

    const mapSettlementTableRow = (
        row: PawnContractSummaryModel
    ): PawnContractClientTableRow<PawnContractSummaryModel> => ({
        id: row.contract.id,
        source: row,
        contractNumber: row.contract.contractNumber,
        customerName: row.customerName,
        branchName: row.branchName,
        itemNames: row.itemNames,
        settlementDate: formatters.formatDate(
            row.contract.updatedAt?.slice(0, 10) ?? row.contract.maturityDate
        ),
        principalAmount: formatters.formatCurrency(row.contract.disbursedValue),
        statusLabel: formatters.getContractStatusLabel(row.contract.contractStatus)
    });

    const mapLocationTableRow = (
        row: PawnContractLocationRowModel,
        index: number
    ): PawnContractClientTableRow<PawnContractLocationRowModel> => ({
        id: row.itemId,
        source: row,
        sequence: index + 1,
        contractNumber: row.contractNumber,
        itemName: row.itemName,
        customerName: row.customerName,
        branchName: row.branchName,
        currentLocationLabel: row.currentLocationLabel,
        primaryActionLabel: row.primaryActionLabel,
        secondaryActionLabel: row.secondaryActionLabel ?? ''
    });

    const mapMaintenanceTableRow = (
        row: PawnContractMaintenanceRowModel
    ): PawnContractClientTableRow<PawnContractMaintenanceRowModel> => ({
        id: row.contractId,
        source: row,
        contractId: row.contractId,
        customerName: row.customerName,
        itemNames: row.itemNames,
        contractDate: formatters.formatDate(row.contractDate),
        checklistLabel: row.checklistLabel
    });

    const displayedNasabahSectionTables = createSectionTableRegistry<
        PawnContractSummaryModel,
        PawnContractNasabahSectionModel,
        PawnContractClientTableRow<PawnContractSummaryModel>
    >(displayedNasabahSections, nasabahTableFields, mapNasabahTableRow);
    const ringkasanSectionTables = createSectionTableRegistry<
        PawnContractSummaryModel,
        PawnContractRingkasanSectionModel,
        PawnContractClientTableRow<PawnContractSummaryModel>
    >(ringkasanSections, ringkasanTableFields, mapRingkasanTableRow);
    const ringkasanPendapatanTableVm = createClientTableVm(
        ringkasanPendapatanRows,
        ringkasanPendapatanTableFields,
        mapRingkasanPendapatanTableRow
    );
    const ajtDataTableVm = createClientTableVm(ajtRows, ajtTableFields, mapAjtTableRow);
    const settlementDataTableVm = createClientTableVm(
        settlementRows,
        settlementTableFields,
        mapSettlementTableRow
    );
    const locationDataTableVm = createClientTableVm(
        locationRows,
        locationTableFields,
        mapLocationTableRow
    );
    const maintenanceDataTableVm = createClientTableVm(
        maintenanceRows,
        maintenanceTableFields,
        mapMaintenanceTableRow
    );
    const canAccessAllBranches = computed(() => branchAccess.value.canAccessAllBranches);
    const isBranchLocked = computed(() => !branchAccess.value.canAccessAllBranches);

    const hasActiveFilters = computed(
        () =>
            state.branchFilter.value !== resolveDefaultBranchFilter(branchAccess.value) ||
            state.statusFilter.value !== 'all'
    );

    watch(
        [state.branchFilter, state.statusFilter],
        async () => {
            await actions.loadFilteredData();
        }
    );

    const actions = {
        loadData: async (): Promise<void> => {
            if (!hasActiveScopedSession(currentSession.value ?? readAuthPortalStoredSession())) {
                state.data.value = null;
                state.filteredData.value = null;
                setters.setError(null);
                return;
            }

            state.isLoading.value = true;
            setters.setError(null);

            try {
                state.data.value = unwrapEitherOrThrow(await getPawnContractDataUsecase.execute());
                const dataFilter = buildDataFilter({
                    branchFilter: state.branchFilter.value,
                    statusFilter: state.statusFilter.value
                }, branchAccess.value);

                state.filteredData.value = isDefaultDataFilter(dataFilter, branchAccess.value)
                    ? state.data.value
                    : unwrapEitherOrThrow(await getPawnContractDataUsecase.execute(dataFilter));
            } catch (error) {
                setters.setError(error instanceof Error ? error.message : String(error));
            } finally {
                state.isLoading.value = false;
            }
        },
        loadFilteredData: async (): Promise<void> => {
            if (!hasActiveScopedSession(currentSession.value ?? readAuthPortalStoredSession()) || !state.data.value) {
                return;
            }

            const dataFilter = buildDataFilter({
                branchFilter: state.branchFilter.value,
                statusFilter: state.statusFilter.value
            }, branchAccess.value);

            if (isDefaultDataFilter(dataFilter, branchAccess.value)) {
                state.filteredData.value = state.data.value;
                return;
            }

            setters.setError(null);

            try {
                state.filteredData.value = unwrapEitherOrThrow(
                    await getPawnContractDataUsecase.execute(dataFilter)
                );
            } catch (error) {
                setters.setError(error instanceof Error ? error.message : String(error));
            }
        },
        resetFilters: (): void => {
            state.branchFilter.value = resolveDefaultBranchFilter(branchAccess.value);
            state.statusFilter.value = 'all';
        }
    };

    watch(
        accessSessionKey,
        () => {
            state.branchFilter.value = resolveDefaultBranchFilter(branchAccess.value);
            state.statusFilter.value = 'all';
            setters.setError(null);

            if (!hasActiveScopedSession(currentSession.value ?? readAuthPortalStoredSession())) {
                state.data.value = null;
                state.filteredData.value = null;
                return;
            }

            if (state.data.value !== null || state.filteredData.value !== null) {
                void actions.loadData();
            }
        },
        { immediate: true }
    );

    return {
        ...state,
        ...setters,
        ...actions,
        ...formatters,
        sortedBranches,
        activeIndexTabMeta,
        indexTabs,
        nasabahTabs,
        activeNasabahSection,
        displayedNasabahSectionTables,
        ringkasanSectionTables,
        ringkasanPendapatanTableVm,
        ringkasanMetrics,
        ajtOptions,
        ajtDataTableVm,
        settlementOptions,
        settlementDataTableVm,
        locationOptions,
        locationDataTableVm,
        maintenanceDataTableVm,
        hasActiveFilters,
        canAccessAllBranches,
        isBranchLocked,
        contractStatusOptions: pawnContractStatusOptions,
        getPawnContractData: actions.loadData
    };
});

function hasActiveScopedSession(session: ReturnType<typeof readAuthPortalStoredSession>): boolean {
    return typeof session?.company.id === 'number' && typeof session?.user.id === 'number';
}

function resolveDefaultBranchFilter(branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>): string {
    return !branchAccess.canAccessAllBranches && branchAccess.assignedBranchId !== null
        ? String(branchAccess.assignedBranchId)
        : 'all';
}

function buildDataFilter(params: {
    branchFilter: string;
    statusFilter: 'all' | PawnContractStatusModel;
}, branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>): PawnContractDataFilterModel {
    return {
        branchId:
            branchAccess.canAccessAllBranches
                ? params.branchFilter !== 'all' && Number.isFinite(Number(params.branchFilter))
                    ? Number(params.branchFilter)
                    : null
                : branchAccess.assignedBranchId,
        contractStatus: params.statusFilter === 'all' ? null : params.statusFilter,
        onlyOpenContracts: false,
        dueWithinDays: null,
        maintenanceRequired: false,
        warehouseOnly: false
    };
}

function isDefaultDataFilter(
    filter: PawnContractDataFilterModel,
    branchAccess: ReturnType<typeof getCurrentAuthPortalBranchAccess>
): boolean {
    return (
        (branchAccess.canAccessAllBranches
            ? filter.branchId === null
            : filter.branchId === branchAccess.assignedBranchId) &&
        filter.contractStatus === null &&
        !filter.onlyOpenContracts &&
        filter.dueWithinDays === null &&
        !filter.maintenanceRequired &&
        !filter.warehouseOnly
    );
}
