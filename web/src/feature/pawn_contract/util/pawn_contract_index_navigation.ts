import type { AppNavigationItem } from '@core/domain/interfaces/app_module.interface';
import {
    PawnContractIndexTabKeyEnum,
    type PawnContractIndexTabKeyModel
} from '@feature/pawn_contract/domain/models';

export type PawnContractIndexNavigationItem = AppNavigationItem & {
    route: string;
    routeName: string;
    title: string;
    tabKey: PawnContractIndexTabKeyModel;
};

const pawnContractIndexBaseRoute = '/pawn-contracts/list';

export const pawnContractIndexNavigationItems: PawnContractIndexNavigationItem[] = [
    {
        key: 'gadai-lihat-data-nasabah',
        label: 'Nasabah Gadai',
        route: `${pawnContractIndexBaseRoute}/nasabah-gadai`,
        routeName: 'PawnContract',
        title: 'Data Gadai - Nasabah Gadai',
        tabKey: PawnContractIndexTabKeyEnum.CustomerContracts,
        icon: 'bi-people',
        caption: 'Pantau data gadai aktif per nasabah'
    },
    {
        key: 'gadai-lihat-data-ringkasan',
        label: 'Ringkasan Harian',
        route: `${pawnContractIndexBaseRoute}/ringkasan-harian`,
        routeName: 'PawnContractDailySummary',
        title: 'Data Gadai - Ringkasan Harian',
        tabKey: PawnContractIndexTabKeyEnum.DailySummary,
        icon: 'bi-graph-up-arrow',
        caption: 'Lihat realisasi dan pendapatan harian'
    },
    {
        key: 'gadai-lihat-data-jatuh-tempo',
        label: 'Gadai Jatuh Tempo',
        route: `${pawnContractIndexBaseRoute}/gadai-jatuh-tempo`,
        routeName: 'PawnContractDueContracts',
        title: 'Data Gadai - Jatuh Tempo',
        tabKey: PawnContractIndexTabKeyEnum.DueContracts,
        icon: 'bi-clock-history',
        caption: 'Kelola gadai yang mendekati jatuh tempo'
    },
    {
        key: 'gadai-lihat-data-pelunasan',
        label: 'Pelunasan & Lelang',
        route: `${pawnContractIndexBaseRoute}/pelunasan-lelang`,
        routeName: 'PawnContractSettlementAuction',
        title: 'Data Gadai - Pelunasan dan Lelang',
        tabKey: PawnContractIndexTabKeyEnum.SettlementAuction,
        icon: 'bi-wallet2',
        caption: 'Pantau pelunasan, lelang, dan refund'
    },
    {
        key: 'gadai-lihat-data-lokasi',
        label: 'Lokasi / Distribusi',
        route: `${pawnContractIndexBaseRoute}/lokasi-distribusi`,
        routeName: 'PawnContractLocationDistribution',
        title: 'Data Gadai - Lokasi dan Distribusi',
        tabKey: PawnContractIndexTabKeyEnum.LocationDistribution,
        icon: 'bi-diagram-3',
        caption: 'Lihat mutasi lokasi barang jaminan'
    },
    {
        key: 'gadai-lihat-data-maintenance',
        label: 'Maintenance',
        route: `${pawnContractIndexBaseRoute}/maintenance`,
        routeName: 'PawnContractMaintenance',
        title: 'Data Gadai - Maintenance',
        tabKey: PawnContractIndexTabKeyEnum.Maintenance,
        icon: 'bi-tools',
        caption: 'Pantau kebutuhan maintenance operasional'
    }
];

export const pawnContractIndexDefaultRoute = pawnContractIndexNavigationItems[0].route;

export const getPawnContractIndexRouteByKey = (
    tabKey: PawnContractIndexTabKeyModel
): string =>
    pawnContractIndexNavigationItems.find((item) => item.tabKey === tabKey)?.route ??
    pawnContractIndexDefaultRoute;

export const resolvePawnContractIndexTabFromPath = (
    path: string
): PawnContractIndexTabKeyModel =>
    pawnContractIndexNavigationItems.find(
        (item) => path === item.route || path.startsWith(`${item.route}/`)
    )?.tabKey ?? PawnContractIndexTabKeyEnum.CustomerContracts;
