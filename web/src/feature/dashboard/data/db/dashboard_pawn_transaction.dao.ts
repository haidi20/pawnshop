import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import {
    auctionTransactionsDao,
    contractExtensionsDao,
    contractPaymentsDao,
    type AuctionTransactionsRow,
    type ContractExtensionsRow,
    type ContractPaymentsRow
} from '@feature/pawn_transaction/data/db';
import type {
    DashboardChartItemModel,
    DashboardLinePointModel,
    DashboardRecentTransactionModel
} from '@feature/dashboard/domain/models';

interface DashboardPawnTransactionSnapshot {
    chartItems: DashboardChartItemModel[];
    lineSeries: DashboardLinePointModel[];
    recentTransactions: DashboardRecentTransactionModel[];
}

const toTimestamp = (value: string): number => {
    const normalizedValue = value.includes(' ') ? value.replace(' ', 'T') : value;
    return Number.isNaN(Date.parse(normalizedValue)) ? 0 : Date.parse(normalizedValue);
};

const buildTransactions = (params: {
    contractPaymentsRows: ContractPaymentsRow[];
    contractExtensionsRows: ContractExtensionsRow[];
    auctionTransactionsRows: AuctionTransactionsRow[];
}): DashboardRecentTransactionModel[] => {
    const contractPayments = params.contractPaymentsRows.map<DashboardRecentTransactionModel>((row) => ({
        key: `payment-${row.id}`,
        type: 'Pembayaran',
        reference: row.payment_reference ?? `PMT-${row.id}`,
        contractId: row.contract_id,
        amount: row.amount,
        transactionDate: row.payment_date,
        description: row.payment_type.split('_').join(' ')
    }));

    const contractExtensions = params.contractExtensionsRows.map<DashboardRecentTransactionModel>((row) => ({
        key: `extension-${row.id}`,
        type: 'Perpanjangan',
        reference: `EXT-${row.id}`,
        contractId: row.contract_id,
        amount: row.extension_fee_amount,
        transactionDate: row.extension_date,
        description: `Jatuh tempo baru ${row.new_maturity_date}`
    }));

    const auctionTransactions = params.auctionTransactionsRows.map<DashboardRecentTransactionModel>((row) => ({
        key: `auction-${row.id}`,
        type: 'Lelang',
        reference: `AUC-${row.id}`,
        contractId: row.contract_id,
        amount: row.auction_sale_amount,
        transactionDate: row.auction_date,
        description: `Refund ${row.refund_amount}`
    }));

    return [...contractPayments, ...contractExtensions, ...auctionTransactions].sort(
        (left, right) => toTimestamp(right.transactionDate) - toTimestamp(left.transactionDate)
    );
};

export class DashboardPawnTransactionDao {
    private async ensureMinimumSeed(limit: number): Promise<void> {
        await seedFeatureTablesIfEmpty('DashboardPawnTransactionDao', [
            contractPaymentsDao,
            contractExtensionsDao,
            auctionTransactionsDao
        ]);

        const [contractPaymentsRows, contractExtensionsRows, auctionTransactionsRows] = await Promise.all([
            contractPaymentsDao.getAll(),
            contractExtensionsDao.getAll(),
            auctionTransactionsDao.getAll()
        ]);

        const totalRows =
            contractPaymentsRows.length + contractExtensionsRows.length + auctionTransactionsRows.length;

        if (totalRows >= limit) {
            return;
        }

        await Promise.all([
            contractPaymentsDao.seed(),
            contractExtensionsDao.seed(),
            auctionTransactionsDao.seed()
        ]);
    }

    async getSnapshot(linePointLimit = 10, recentTransactionLimit = 5): Promise<DashboardPawnTransactionSnapshot> {
        await this.ensureMinimumSeed(linePointLimit);

        const [contractPaymentsRows, contractExtensionsRows, auctionTransactionsRows] = await Promise.all([
            contractPaymentsDao.getAll(),
            contractExtensionsDao.getAll(),
            auctionTransactionsDao.getAll()
        ]);

        const transactions = buildTransactions({
            contractPaymentsRows,
            contractExtensionsRows,
            auctionTransactionsRows
        });

        const latestLineTransactions = [...transactions]
            .slice(0, linePointLimit)
            .reverse()
            .map<DashboardLinePointModel>((transaction, index) => ({
                key: transaction.key,
                type: transaction.type,
                label: `Titik ${index + 1}`,
                amount: transaction.amount,
                transactionDate: transaction.transactionDate
            }));

        return {
            chartItems: [
                { key: 'contract_payments', label: 'Pembayaran', count: contractPaymentsRows.length },
                { key: 'contract_extensions', label: 'Perpanjangan', count: contractExtensionsRows.length },
                { key: 'auction_transactions', label: 'Lelang', count: auctionTransactionsRows.length }
            ],
            lineSeries: latestLineTransactions,
            recentTransactions: transactions.slice(0, recentTransactionLimit)
        };
    }
}

export const dashboardPawnTransactionDao = new DashboardPawnTransactionDao();
