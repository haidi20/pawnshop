import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { ContractPaymentModel } from '@feature/pawn_transaction/domain/models/contract-payment.model';
import type { ContractExtensionModel } from '@feature/pawn_transaction/domain/models/contract-extension.model';
import type { AuctionTransactionModel } from '@feature/pawn_transaction/domain/models/auction-transaction.model';

export interface PawnTransactionDataModel extends FeatureModuleDataModel {
    contractPayments: ContractPaymentModel[];
    contractExtensions: ContractExtensionModel[];
    auctionTransactions: AuctionTransactionModel[];
}

export const createPawnTransactionDataModel = (params: {
    module: AppModuleSummary;
    contractPayments: ContractPaymentModel[];
    contractExtensions: ContractExtensionModel[];
    auctionTransactions: AuctionTransactionModel[];
}): PawnTransactionDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'contract_payments', label: 'Contract Payments', count: params.contractPayments.length },
        { key: 'contract_extensions', label: 'Contract Extensions', count: params.contractExtensions.length },
        { key: 'auction_transactions', label: 'Auction Transactions', count: params.auctionTransactions.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
