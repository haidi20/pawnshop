import { seedFeatureTablesIfEmpty } from '@core/data/datasources/db/feature_table_seeder';
import { getCurrentAuthPortalBranchAccess } from '@feature/auth_portal/util/auth_portal_session';
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
import { pawnContractsDao } from '@feature/pawn_contract/data/db';
import { ensurePawnContractDemoDataSeed } from '@feature/pawn_contract/data/seeders/pawn_contract_demo_data.seeder';

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
        await ensurePawnContractDemoDataSeed();
        await seedFeatureTablesIfEmpty('DashboardPawnTransactionDao', [pawnContractsDao]);

        const [contractPaymentsRows, contractExtensionsRows, auctionTransactionsRows] = await Promise.all([
            contractPaymentsDao.getAll(),
            contractExtensionsDao.getAll(),
            auctionTransactionsDao.getAll()
        ]);

        const scopedRows = await this.applyBranchAccess({
            contractPaymentsRows,
            contractExtensionsRows,
            auctionTransactionsRows
        });

        const transactions = buildTransactions({
            contractPaymentsRows: scopedRows.contractPaymentsRows,
            contractExtensionsRows: scopedRows.contractExtensionsRows,
            auctionTransactionsRows: scopedRows.auctionTransactionsRows
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
                { key: 'contract_payments', label: 'Pembayaran', count: scopedRows.contractPaymentsRows.length },
                { key: 'contract_extensions', label: 'Perpanjangan', count: scopedRows.contractExtensionsRows.length },
                { key: 'auction_transactions', label: 'Lelang', count: scopedRows.auctionTransactionsRows.length }
            ],
            lineSeries: latestLineTransactions,
            recentTransactions: transactions.slice(0, recentTransactionLimit)
        };
    }

    private async applyBranchAccess(params: {
        contractPaymentsRows: ContractPaymentsRow[];
        contractExtensionsRows: ContractExtensionsRow[];
        auctionTransactionsRows: AuctionTransactionsRow[];
    }): Promise<{
        contractPaymentsRows: ContractPaymentsRow[];
        contractExtensionsRows: ContractExtensionsRow[];
        auctionTransactionsRows: AuctionTransactionsRow[];
    }> {
        const branchAccess = getCurrentAuthPortalBranchAccess();

        if (branchAccess.canAccessAllBranches) {
            return params;
        }

        if (branchAccess.assignedBranchId === null) {
            return {
                contractPaymentsRows: [],
                contractExtensionsRows: [],
                auctionTransactionsRows: []
            };
        }

        const allowedContractIds = new Set(
            (await pawnContractsDao.findByFilters({ branchId: branchAccess.assignedBranchId })).map((row) => row.id)
        );

        return {
            contractPaymentsRows: params.contractPaymentsRows.filter((row) => allowedContractIds.has(row.contract_id)),
            contractExtensionsRows: params.contractExtensionsRows.filter((row) => allowedContractIds.has(row.contract_id)),
            auctionTransactionsRows: params.auctionTransactionsRows.filter((row) => allowedContractIds.has(row.contract_id))
        };
    }
}

export const dashboardPawnTransactionDao = new DashboardPawnTransactionDao();
