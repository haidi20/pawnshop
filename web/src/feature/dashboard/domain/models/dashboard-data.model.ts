export interface DashboardChartItemModel {
    key: string;
    label: string;
    count: number;
}

export interface DashboardRecentTransactionModel {
    key: string;
    type: 'Pembayaran' | 'Perpanjangan' | 'Lelang';
    reference: string;
    contractId: number;
    amount: number;
    transactionDate: string;
    description: string;
}

export interface DashboardLinePointModel {
    key: string;
    type: 'Pembayaran' | 'Perpanjangan' | 'Lelang';
    label: string;
    amount: number;
    transactionDate: string;
}

export interface DashboardDataModel {
    chartItems: DashboardChartItemModel[];
    lineSeries: DashboardLinePointModel[];
    recentTransactions: DashboardRecentTransactionModel[];
}

export const createDashboardDataModel = (params: {
    chartItems: DashboardChartItemModel[];
    lineSeries: DashboardLinePointModel[];
    recentTransactions: DashboardRecentTransactionModel[];
}): DashboardDataModel => ({
    chartItems: params.chartItems,
    lineSeries: params.lineSeries,
    recentTransactions: params.recentTransactions
});
