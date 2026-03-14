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
import { pawnContractsDao, type PawnContractsRow } from '@feature/pawn_contract/data/db';
import { ensurePawnContractDemoDataSeed } from '@feature/pawn_contract/data/seeders/pawn_contract_demo_data.seeder';

interface DashboardPawnTransactionSnapshot {
    chartItems: DashboardChartItemModel[];
    lineSeries: DashboardLinePointModel[];
    recentTransactions: DashboardRecentTransactionModel[];
    contractCount: number;
}

const toTimestamp = (value: string): number => {
    const normalizedValue = value.includes(' ') ? value.replace(' ', 'T') : value;
    return Number.isNaN(Date.parse(normalizedValue)) ? 0 : Date.parse(normalizedValue);
};

const buildTransactions = (params: {
    pawnContractsRows: PawnContractsRow[];
    contractPaymentsRows: ContractPaymentsRow[];
    contractExtensionsRows: ContractExtensionsRow[];
    auctionTransactionsRows: AuctionTransactionsRow[];
}): DashboardRecentTransactionModel[] => {
    const contracts = params.pawnContractsRows.map<DashboardRecentTransactionModel>((row) => ({
        key: `contract-${row.id}`,
        type: 'Gadai',
        reference: row.contract_number,
        contractId: row.id,
        amount: row.disbursed_value,
        transactionDate: row.contract_date,
        description: `Pencairan gadai baru`
    }));

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

    return [...contracts, ...contractPayments, ...contractExtensions, ...auctionTransactions].sort(
        (left, right) => toTimestamp(right.transactionDate) - toTimestamp(left.transactionDate)
    );
};

export class DashboardPawnTransactionDao {
    async getSnapshot(linePointLimit = 10, recentTransactionLimit = 5): Promise<DashboardPawnTransactionSnapshot> {
        await ensurePawnContractDemoDataSeed();
        await seedFeatureTablesIfEmpty('DashboardPawnTransactionDao', [pawnContractsDao]);

        const branchAccess = getCurrentAuthPortalBranchAccess();
        let allowedContracts: PawnContractsRow[] = [];
        
        if (branchAccess.canAccessAllBranches) {
            allowedContracts = await pawnContractsDao.getAll();
        } else if (branchAccess.assignedBranchId !== null) {
            allowedContracts = await pawnContractsDao.findByFilters({ branchId: branchAccess.assignedBranchId });
        }

        const contractCount = allowedContracts.length;

        const [contractPaymentsRows, contractExtensionsRows, auctionTransactionsRows] = await Promise.all([
            contractPaymentsDao.getAll(),
            contractExtensionsDao.getAll(),
            auctionTransactionsDao.getAll()
        ]);

        const scopedRows = this.applyContractIdScoping(
            new Set(allowedContracts.map((row) => row.id)),
            {
                contractPaymentsRows,
                contractExtensionsRows,
                auctionTransactionsRows
            }
        );

        const transactions = buildTransactions({
            pawnContractsRows: allowedContracts,
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
                { key: 'pawn_contracts', label: 'Gadai Baru', count: allowedContracts.length },
                { key: 'contract_payments', label: 'Pembayaran', count: scopedRows.contractPaymentsRows.length },
                { key: 'contract_extensions', label: 'Perpanjangan', count: scopedRows.contractExtensionsRows.length },
                { key: 'auction_transactions', label: 'Lelang', count: scopedRows.auctionTransactionsRows.length }
            ],
            lineSeries: latestLineTransactions,
            recentTransactions: transactions.slice(0, recentTransactionLimit),
            contractCount
        };
    }

    private applyContractIdScoping(
        allowedContractIds: Set<number>,
        params: {
            contractPaymentsRows: ContractPaymentsRow[];
            contractExtensionsRows: ContractExtensionsRow[];
            auctionTransactionsRows: AuctionTransactionsRow[];
        }
    ): {
        contractPaymentsRows: ContractPaymentsRow[];
        contractExtensionsRows: ContractExtensionsRow[];
        auctionTransactionsRows: AuctionTransactionsRow[];
    } {
        return {
            contractPaymentsRows: params.contractPaymentsRows.filter((row) => allowedContractIds.has(row.contract_id)),
            contractExtensionsRows: params.contractExtensionsRows.filter((row) => allowedContractIds.has(row.contract_id)),
            auctionTransactionsRows: params.auctionTransactionsRows.filter((row) => allowedContractIds.has(row.contract_id))
        };
    }
}

export const dashboardPawnTransactionDao = new DashboardPawnTransactionDao();
